// Canvas MCP Server - Content Script
(function() {
  'use strict';

  // Prevent multiple executions
  if (window.canvasMCPInitialized) {
    console.log('Canvas MCP already initialized, skipping');
    return;
  }
  window.canvasMCPInitialized = true;

  console.log('Canvas MCP content script loaded on:', window.location.href);

  const API_BASE = '/api/v1';

  async function fetchJson(url) {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  }

  async function fetchJsonWithPagination(url, maxItems = Infinity) {
    let results = [];
    let nextUrl = url;
    let pageCount = 0;

    while (nextUrl && results.length < maxItems && pageCount < 10) {
      const response = await fetch(nextUrl, { credentials: 'include' });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        results = results.concat(data);
      } else if (data) {
        results.push(data);
      }

      const linkHeader = response.headers.get('link');
      nextUrl = null;

      if (linkHeader) {
        const parts = linkHeader.split(',');
        for (const part of parts) {
          const section = part.split(';');
          if (section.length !== 2) continue;
          const urlPart = section[0].trim().replace(/[<>]/g, '');
          const relPart = section[1].trim();
          if (relPart === 'rel="next"') {
            nextUrl = urlPart;
            break;
          }
        }
      }

      pageCount += 1;
    }

    return results.slice(0, maxItems);
  }

  async function fetchCourses() {
    try {
      const url = `${API_BASE}/courses?enrollment_state=active&completed=false&include[]=term&per_page=100`;
      const courses = await fetchJsonWithPagination(url, 200);
      return courses.map(course => ({
        id: String(course.id),
        name: course.name,
        code: course.course_code,
        term: course.term?.name || course.term?.id || null,
        url: `${window.location.origin}/courses/${course.id}`
      }));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      return [];
    }
  }

  async function fetchCourseAssignments(courseId) {
    try {
      const url = `${API_BASE}/courses/${courseId}/assignments?per_page=100`;
      const assignments = await fetchJsonWithPagination(url, 100);
      return assignments.map(assignment => ({
        id: String(assignment.id),
        name: assignment.name,
        dueDate: assignment.due_at || null,
        pointsPossible: assignment.points_possible,
        published: assignment.published,
        url: assignment.html_url || `${window.location.origin}/courses/${courseId}/assignments/${assignment.id}`
      }));
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      return [];
    }
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { type, courseId } = message;

      let promise;

      switch (type) {
        case 'FETCH_COURSES':
          promise = fetchCourses();
          break;
        case 'FETCH_ASSIGNMENTS':
          if (!courseId) {
            sendResponse({ success: false, error: 'courseId required' });
            return;
          }
          promise = fetchCourseAssignments(courseId);
          break;
        case 'FETCH_ALL_DATA':
          promise = (async () => {
            const courses = await fetchCourses();
            const assignmentsData = {};
            for (const course of courses) {
              try {
                assignmentsData[course.id] = await fetchCourseAssignments(course.id);
              } catch (error) {
                console.error(`Failed to fetch assignments for course ${course.id}:`, error);
                assignmentsData[course.id] = [];
              }
            }
            return { courses, assignments: assignmentsData };
          })();
          break;
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
          return;
      }

      promise
        .then(data => {
          sendResponse({ success: true, data });
          chrome.runtime.sendMessage({
            type: 'CANVAS_DATA',
            data: Array.isArray(data) ? { courses: data } : data
          });
        })
        .catch(error => {
          console.error('Canvas MCP content script error:', error);
          sendResponse({ success: false, error: error.message });
        });

      return true;
    });
  }

  console.log('Canvas MCP content script initialized');
})();
