document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');
  const colorInput = document.getElementById('color-input');
  const brushSizeInput = document.getElementById('brush-size');
  const brushSizeDisplay = document.getElementById('brush-size-display');
  const clearButton = document.getElementById('clear-button');
  const connectionStatus = document.getElementById('connection-status');
  const userCount = document.getElementById('user-count');

  // Set canvas dimensions
  lastBoard = [];

  function resizeCanvas() {
    // TODO: Set the canvas width and height based on its parent element
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // Redraw the canvas with the current board state when resized
    // TODO: Call redrawCanvas() function
    redrawCanvas(lastBoard);
  }

  // Initialize canvas size
  // TODO: Call resizeCanvas()
  resizeCanvas();
  
  // Handle window resize
  // TODO: Add an event listener for the 'resize' event that calls resizeCanvas
  window.addEventListener('resize', resizeCanvas);

  // Drawing variables
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Connect to Socket.IO server
  // TODO: Create a socket connection to the server at 'http://localhost:3000'
  const socket = io('http://localhost:3000');

  //not exactly sure why but website wouldn't work properly if I called resizeCanvas before initializing the socket

  // TODO: Set up Socket.IO event handlers
  socket.on('connect', () => {
    connectionStatus.textContent = 'Connected';
    connectionStatus.style.color = 'green';
  });

  socket.on('draw', (drawingData) => {
    const { x0, y0, x1, y1, color, size } = drawingData;
    drawLine(x0, y0, x1, y1, color, size);
    lastBoard.push(drawingData);
  });

  socket.on('clear', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    lastBoard = [];
  });

  socket.on('currentUsers', (count) => {
    userCount.textContent = `${count}`;
  });

  socket.on('boardState', (boardState) => {
      lastBoard = boardState;
      redrawCanvas(boardState);
  });

  
  // Canvas event handlers
  // TODO: Add event listeners for mouse events (mousedown, mousemove, mouseup, mouseout)
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  
  // Touch support (optional)
  // TODO: Add event listeners for touch events (touchstart, touchmove, touchend, touchcancel)
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', stopDrawing);
  canvas.addEventListener('touchcancel', stopDrawing);
  
  // Clear button event handler
  // TODO: Add event listener for the clear button
  clearButton.addEventListener('click', clearCanvas);
  
  // Update brush size display
  // TODO: Add event listener for brush size input changes
  brushSizeInput.addEventListener('input', (e) => {
    const size = e.target.value;
    brushSizeDisplay.textContent = size;
  });

  // Drawing functions
  function startDrawing(e) {
    // TODO: Set isDrawing to true and capture initial coordinates
    isDrawing = true;
    const { offsetX, offsetY } = getCoordinates(e);
    lastX = offsetX;
    lastY = offsetY;
  }

  function draw(e) {
    // TODO: If not drawing, return
    // TODO: Get current coordinates
    // TODO: Emit 'draw' event to the server with drawing data
    // TODO: Update last position
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    const color = colorInput.value;
    const size = brushSizeInput.value;
    const drawingData = {
      x0: lastX,
      y0: lastY,
      x1: offsetX,
      y1: offsetY,
      color,
      size
    };

    socket.emit('draw', drawingData);
    lastX = offsetX;
    lastY = offsetY;
  }

  function drawLine(x0, y0, x1, y1, color, size) {
    // TODO: Draw a line on the canvas using the provided parameters
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);

    context.stroke()
  }

  function stopDrawing() {
    // TODO: Set isDrawing to false
    isDrawing = false;
  }

  function clearCanvas() {
    // TODO: Emit 'clear' event to the server
    socket.emit('clear');
  }

  function redrawCanvas(boardState = []) {
    // TODO: Clear the canvas
    // TODO: Redraw all lines from the board state
    context.clearRect(0, 0, canvas.width, canvas.height);

    boardState.forEach(line => {
      const { x0, y0, x1, y1, color, size } = line;
      drawLine(x0, y0, x1, y1, color, size);
    });
  }

  // Helper function to get coordinates from mouse or touch event
  function getCoordinates(e) {
    // TODO: Extract coordinates from the event (for both mouse and touch events)
    // HINT: For touch events, use e.touches[0] or e.changedTouches[0]
    // HINT: For mouse events, use e.offsetX and e.offsetY
    if (e.touches) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        offsetX: touch.clientX - canvas.getBoundingClientRect().left,
        offsetY: touch.clientY - canvas.getBoundingClientRect().top
      };
    } 
    else {
      return {
        offsetX: e.offsetX,
        offsetY: e.offsetY
      };
    }
  }

  // Handle touch events
  function handleTouchStart(e) {
    // TODO: Prevent default behavior and call startDrawing
    e.preventDefault(); 
    startDrawing(e);
  }

  function handleTouchMove(e) {
    // TODO: Prevent default behavior and call draw
    e.preventDefault();
    if(!isDrawing) return;

    const coords = getCoordinates(e);
    draw(coords);
  }

});