// Canvas MCP Server - Background Service Worker with Native Messaging

const MCP_TOOLS = {
  list_courses: {
    name: "list_courses",
    description: "Get list of all Canvas courses for the current user",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  get_course_assignments: {
    name: "get_course_assignments",
    description: "Get assignments for a specific course",
    inputSchema: {
      type: "object",
      properties: {
        course_id: {
          type: "string",
          description: "The Canvas course ID"
        }
      },
      required: ["course_id"]
    }
  }
};

// MCP Server HTTP endpoint (extension uses HTTP to avoid cert issues)
const MCP_SERVER_URL = 'http://localhost:8765/canvas-data';

// Store Canvas data
let canvasData = {
  courses: [],
  assignments: {},
  lastUpdate: null
};

// Track MCP server connection status
let mcpServerConnected = false;

// Send Canvas data to MCP server via HTTP
async function sendDataToMCPServer() {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courses: canvasData.courses,
        assignments: canvasData.assignments
      })
    });

    if (response.ok) {
      mcpServerConnected = true;
      console.log('Successfully sent Canvas data to MCP server');
    } else {
      mcpServerConnected = false;
      console.warn('MCP server responded with error:', response.status);
    }
  } catch (error) {
    mcpServerConnected = false;
    console.log('MCP server not available (this is okay if not using Claude Desktop)');
  }
}

// Check MCP server health
async function checkMCPServerHealth() {
  try {
    const response = await fetch('http://localhost:8765/health');
    if (response.ok) {
      mcpServerConnected = true;
      return true;
    }
  } catch (error) {
    mcpServerConnected = false;
  }
  return false;
}

// Get configured Canvas URL from storage
async function getConfiguredCanvasUrl() {
  try {
    const result = await chrome.storage.local.get(['canvasUrl']);
    return result.canvasUrl || 'https://canvas.instructure.com'; // Default fallback
  } catch (error) {
    console.error('Error getting Canvas URL from storage:', error);
    return 'https://canvas.instructure.com';
  }
}

// Helper function to detect if a URL is a Canvas instance
function isCanvasUrl(url) {
  if (!url) return false;

  const canvasPatterns = [
    /^https?:\/\/[^\/]*instructure\.com/,
    /^https?:\/\/[^\/]*canvaslms\.com/,
    /^https?:\/\/canvas\.[^\/]+/,
    /^https?:\/\/[^\/]*\.edu\/.*canvas/i,
  ];

  return canvasPatterns.some(pattern => pattern.test(url));
}

// Auto-detect and save Canvas URLs from visited tabs
async function detectAndSaveCanvasUrl(url) {
  if (!isCanvasUrl(url)) return;

  try {
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // Get existing detected URLs
    const result = await chrome.storage.local.get(['detectedCanvasUrls']);
    const detectedUrls = result.detectedCanvasUrls || [];

    // Check if this URL already exists
    const existingIndex = detectedUrls.findIndex(item => item.url === baseUrl);

    if (existingIndex >= 0) {
      // Update timestamp
      detectedUrls[existingIndex].lastSeen = new Date().toISOString();
    } else {
      // Add new URL
      detectedUrls.unshift({
        url: baseUrl,
        lastSeen: new Date().toISOString()
      });
    }

    // Keep only 10 most recent
    const trimmedUrls = detectedUrls.slice(0, 10);

    await chrome.storage.local.set({ detectedCanvasUrls: trimmedUrls });
    console.log('Detected Canvas URL:', baseUrl);
  } catch (error) {
    console.error('Error detecting Canvas URL:', error);
  }
}

// Helper function to get active Canvas tab
async function getCanvasTab() {
  return new Promise(async (resolve) => {
    // Get configured Canvas URL
    const configuredUrl = await getConfiguredCanvasUrl();
    const configuredDomain = new URL(configuredUrl).hostname;

    // Build query patterns - include configured domain and common Canvas domains
    const queryPatterns = [
      `*://${configuredDomain}/*`,
      '*://*.instructure.com/*',
      '*://*.canvaslms.com/*'
    ];

    // First try to find any open Canvas tab
    chrome.tabs.query({ url: queryPatterns }, (tabs) => {
      if (tabs && tabs.length > 0) {
        // Prefer configured domain if available
        const preferredTab = tabs.find(tab => tab.url && tab.url.includes(configuredDomain));
        resolve(preferredTab || tabs[0]);
      } else {
        // No Canvas tab found, create one with configured URL
        chrome.tabs.create({ url: configuredUrl, active: false }, (tab) => {
          const listener = (tabId, changeInfo) => {
            if (tabId === tab.id && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve(tab);
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });
      }
    });
  });
}

// Helper function to send message to content script
function sendMessageToContent(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.type);
  
  if (request.type === 'CANVAS_DATA') {
    if (request.data.courses) {
      canvasData.courses = request.data.courses;
      canvasData.lastUpdate = new Date().toISOString();
      console.log('Stored courses:', canvasData.courses.length);
    }
    if (request.data.assignments) {
      if (request.data.courseId) {
        canvasData.assignments[request.data.courseId] = request.data.assignments;
      } else if (typeof request.data.assignments === 'object') {
        Object.assign(canvasData.assignments, request.data.assignments);
      }
    }

    // Send updated data to MCP server
    sendDataToMCPServer();

    sendResponse({ status: 'stored' });
  }
  
  if (request.type === 'MCP_REQUEST') {
    handleMCPRequest(request.payload)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (request.type === 'GET_MCP_STATUS') {
    // Check MCP server health asynchronously
    checkMCPServerHealth().then(() => {
      sendResponse({
        status: 'active',
        toolCount: Object.keys(MCP_TOOLS).length,
        dataLastUpdate: canvasData.lastUpdate,
        courseCount: canvasData.courses.length,
        nativeHostConnected: mcpServerConnected
      });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.type === 'REFRESH_DATA') {
    getCanvasTab()
      .then(async (tab) => {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          await new Promise(resolve => setTimeout(resolve, 500));
          const response = await sendMessageToContent(tab.id, { type: 'FETCH_ALL_DATA' });
          if (response && response.success) {
            sendResponse({ success: true, data: response.data });
          } else {
            sendResponse({ success: false, error: response?.error || 'Failed to fetch data' });
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
          sendResponse({ success: false, error: error.message });
        }
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function handleMCPRequest(payload) {
  const { method, params } = payload;
  
  console.log('Handling MCP request:', method, params);
  
  switch(method) {
    case 'initialize':
      return {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "canvas-mcp-server",
          version: "1.0.0"
        },
        capabilities: {
          tools: {}
        }
      };
      
    case 'tools/list':
      return {
        tools: Object.values(MCP_TOOLS)
      };
      
    case 'tools/call':
      return await handleToolCall(params);
      
    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

async function handleToolCall(params) {
  const { name, arguments: args } = params;
  
  switch(name) {
    case 'list_courses':
      if (canvasData.courses.length === 0) {
        try {
          const tab = await getCanvasTab();
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          await new Promise(resolve => setTimeout(resolve, 500));
          const response = await sendMessageToContent(tab.id, { type: 'FETCH_COURSES' });
          if (response && response.success) {
            canvasData.courses = response.data;
            canvasData.lastUpdate = new Date().toISOString();
          }
        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            courses: canvasData.courses,
            count: canvasData.courses.length,
            lastUpdate: canvasData.lastUpdate
          }, null, 2)
        }]
      };
      
    case 'get_course_assignments':
      const courseId = args.course_id;
      let assignments = canvasData.assignments[courseId] || [];
      
      if (assignments.length === 0) {
        try {
          const tab = await getCanvasTab();
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          await new Promise(resolve => setTimeout(resolve, 500));
          const response = await sendMessageToContent(tab.id, { 
            type: 'FETCH_ASSIGNMENTS',
            courseId: courseId 
          });
          if (response && response.success) {
            assignments = response.data;
            canvasData.assignments[courseId] = assignments;
          }
        } catch (error) {
          console.error('Error fetching assignments:', error);
        }
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            courseId: courseId,
            assignments: assignments,
            count: assignments.length
          }, null, 2)
        }]
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Keep service worker alive
if (chrome.alarms) {
  try {
    chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'keepAlive') {
        console.log('Service worker keepalive ping');
      }
    });
  } catch (error) {
    console.warn('Failed to set up alarms:', error);
  }
}

// Listen for tab updates to auto-detect Canvas URLs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    detectAndSaveCanvasUrl(tab.url);
  }
});

// Listen for tab activation to detect Canvas URLs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      detectAndSaveCanvasUrl(tab.url);
    }
  } catch (error) {
    console.error('Error detecting Canvas URL on tab activation:', error);
  }
});

// Check MCP server connection on startup
checkMCPServerHealth().then(connected => {
  if (connected) {
    console.log('MCP server is available');
    // Send any existing Canvas data
    if (canvasData.courses.length > 0) {
      sendDataToMCPServer();
    }
  } else {
    console.log('MCP server not available (extension will work standalone)');
  }
});

console.log('Canvas MCP Server initialized');
