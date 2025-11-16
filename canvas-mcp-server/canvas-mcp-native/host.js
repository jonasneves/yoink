#!/usr/bin/env node

/**
 * Canvas MCP Server for Claude Desktop
 *
 * - HTTP Server (localhost:8765) receives Canvas data from Chrome Extension
 * - STDIO protocol communicates with Claude Desktop using MCP
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const readline = require('readline');

// Configuration
const HTTP_PORT = 8765;  // For Chrome Extension data
const LOG_FILE = path.join(process.env.HOME || process.env.USERPROFILE, 'canvas-mcp-host.log');

// In-memory cache for Canvas data
let canvasData = {
  courses: [],
  assignments: {},
  lastUpdate: null
};

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  // Log to stderr (won't interfere with stdout MCP protocol)
  process.stderr.write(logMessage);
}

log('Canvas MCP Server started');

// ============================================================================
// HTTP Request Handler (for Chrome Extension)
// ============================================================================

function handleRequest(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // POST /canvas-data - Receive Canvas data from extension
  if (req.method === 'POST' && parsedUrl.pathname === '/canvas-data') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        if (data.courses) {
          canvasData.courses = data.courses;
          log(`Received ${data.courses.length} courses from extension`);
        }

        if (data.assignments) {
          Object.assign(canvasData.assignments, data.assignments);
          log(`Received assignments for ${Object.keys(data.assignments).length} courses`);
        }

        canvasData.lastUpdate = new Date().toISOString();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', received: true }));

      } catch (error) {
        log(`Error parsing Canvas data: ${error.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: error.message }));
      }
    });

    return;
  }

  // GET /canvas-data - Return current Canvas data (for debugging)
  if (req.method === 'GET' && parsedUrl.pathname === '/canvas-data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(canvasData, null, 2));
    return;
  }

  // GET /health - Health check
  if (req.method === 'GET' && parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      coursesCount: canvasData.courses.length,
      lastUpdate: canvasData.lastUpdate
    }));
    return;
  }

  // GET / - Server info
  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'Canvas MCP Server',
      version: '1.0.0',
      mode: 'Claude Desktop Extension',
      endpoints: {
        canvasData: '/canvas-data',
        health: '/health'
      }
    }, null, 2));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'error', message: 'Not found' }));
}

// ============================================================================
// HTTP Server (for Chrome Extension)
// ============================================================================

const httpServer = http.createServer(handleRequest);

// ============================================================================
// MCP Protocol Handler
// ============================================================================

async function handleMCPRequest(request) {
  const { method, params, id } = request;

  try {
    let result;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "canvas-mcp-server",
            version: "1.0.0"
          },
          capabilities: {
            tools: {}
          }
        };
        break;

      case 'tools/list':
        result = {
          tools: [
            {
              name: "list_courses",
              description: "Get list of all Canvas courses for the current user",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              }
            },
            {
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
          ]
        };
        break;

      case 'tools/call':
        const toolName = params.name;

        if (toolName === 'list_courses') {
          const coursesData = {
            courses: canvasData.courses,
            count: canvasData.courses.length,
            lastUpdate: canvasData.lastUpdate
          };

          if (canvasData.courses.length === 0) {
            coursesData.note = "No courses data available. Make sure the Chrome extension is running and has fetched Canvas data.";
          }

          result = {
            content: [{
              type: "text",
              text: JSON.stringify(coursesData, null, 2)
            }]
          };

        } else if (toolName === 'get_course_assignments') {
          const courseId = params.arguments.course_id;
          const assignments = canvasData.assignments[courseId] || [];

          const assignmentsData = {
            courseId: courseId,
            assignments: assignments,
            count: assignments.length
          };

          if (assignments.length === 0) {
            assignmentsData.note = "No assignments found for this course. Make sure the Chrome extension has fetched assignment data.";
          }

          result = {
            content: [{
              type: "text",
              text: JSON.stringify(assignmentsData, null, 2)
            }]
          };

        } else {
          throw new Error(`Unknown tool: ${toolName}`);
        }
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return {
      jsonrpc: "2.0",
      id: id,
      result: result
    };

  } catch (error) {
    log(`Error in MCP handler: ${error.message}`);
    return {
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32603,
        message: error.message
      }
    };
  }
}

// ============================================================================
// Server Startup
// ============================================================================

// Start HTTP server for Chrome Extension
httpServer.listen(HTTP_PORT, 'localhost', () => {
  log(`HTTP server listening on http://localhost:${HTTP_PORT}`);
  log(`Extension endpoint: http://localhost:${HTTP_PORT}/canvas-data`);
});

// Start STDIO handler for Claude Desktop
log('Starting STDIO handler for Claude Desktop');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    log(`MCP Request: ${request.method}`);

    const response = await handleMCPRequest(request);

    // Send response via stdout (newline-delimited JSON)
    process.stdout.write(JSON.stringify(response) + '\n');

  } catch (error) {
    log(`Error handling request: ${error.message}`);

    // Send error response
    process.stdout.write(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32700,
        message: `Parse error: ${error.message}`
      }
    }) + '\n');
  }
});

rl.on('close', () => {
  log('STDIO connection closed');
  httpServer.close();
  process.exit(0);
});

log('Server ready - waiting for Canvas data and MCP requests');

// Handle process termination
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down');
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down');
  httpServer.close();
  process.exit(0);
});
