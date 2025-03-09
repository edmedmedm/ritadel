import { useState, useEffect, useRef } from 'react';
import { Paper, Typography, IconButton, Box, Snackbar, Alert } from '@mui/material';
import { 
  Close as CloseIcon, 
  DragIndicator as DragIcon, 
  Minimize as MinimizeIcon,
  MaximizeOutlined as MaximizeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

export default function EnhancedConsole() {
  const [messages, setMessages] = useState(['Console initialized']);
  const [connected, setConnected] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const consoleRef = useRef(null);
  const dragRef = useRef(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Console mounted');
    connectWebSocket();
    
    return () => {
      if (dragRef.current?.ws) {
        dragRef.current.ws.close();
      }
    };
  }, []);
  
  const connectWebSocket = () => {
    setMessages(prev => [...prev, 'Attempting WebSocket connection...']);
    
    try {
      const ws = new WebSocket(`ws://localhost:5000/ws/logs`);
      
      // Store the WebSocket connection in a ref for cleanup
      dragRef.current = { ws };
      
      ws.onopen = () => {
        setConnected(true);
        setMessages(prev => [...prev, '✅ WebSocket connected successfully']);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, data.message]);
          
          // Auto-scroll to bottom
          if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
          }
        } catch (e) {
          setMessages(prev => [...prev, `Error parsing: ${event.data}`]);
        }
      };
      
      ws.onerror = (e) => {
        setMessages(prev => [...prev, '❌ WebSocket error occurred']);
        setError('WebSocket connection failed. Is the API server running?');
        setConnected(false);
      };
      
      ws.onclose = () => {
        setConnected(false);
        setMessages(prev => [...prev, '⚠️ WebSocket connection closed']);
      };
    } catch (error) {
      setMessages(prev => [...prev, `❌ WebSocket setup error: ${error.message}`]);
      setError(error.message);
    }
  };
  
  // Setup draggable functionality
  useEffect(() => {
    if (!dragRef.current) return;
    
    const handleMouseDown = (e) => {
      if (!e.target.closest('.drag-handle')) return;
      
      setDragging(true);
      
      // Store the initial click offset
      dragRef.current.offsetX = e.clientX - position.x;
      dragRef.current.offsetY = e.clientY - position.y;
      
      // Prevent text selection during drag
      e.preventDefault();
    };
    
    const handleMouseMove = (e) => {
      if (!dragging) return;
      
      // Calculate new position
      const newX = e.clientX - dragRef.current.offsetX;
      const newY = e.clientY - dragRef.current.offsetY;
      
      // Keep console within viewport
      const maxX = window.innerWidth - (minimized ? 200 : 400);
      const maxY = window.innerHeight - (minimized ? 40 : 300);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };
    
    const handleMouseUp = () => {
      setDragging(false);
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, position, minimized]);
  
  return (
    <>
      <Paper 
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: position.y,
          right: position.x,
          width: minimized ? 200 : 400,
          height: minimized ? 40 : 300,
          zIndex: 9999,
          overflow: 'hidden',
          backgroundColor: '#000',
          color: '#0f0',
          border: connected ? '1px solid #0f0' : '1px solid red',
          borderRadius: 1,
          fontFamily: 'monospace',
          transition: 'height 0.2s ease-in-out, width 0.2s ease-in-out',
          resize: !minimized ? 'both' : 'none',
          cursor: dragging ? 'grabbing' : 'default'
        }}
      >
        <Box 
          className="drag-handle"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 0.5,
            pl: 1,
            backgroundColor: connected ? '#003300' : '#330000',
            borderBottom: '1px solid',
            borderColor: connected ? 'success.main' : 'error.main',
            cursor: 'grab',
            userSelect: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DragIcon fontSize="small" sx={{ mr: 1, color: '#aaa' }} />
            <Typography variant="subtitle2" sx={{ color: '#fff', fontSize: '0.8rem' }}>
              Console {connected ? '(Connected)' : '(Disconnected)'}
            </Typography>
          </Box>
          <Box>
            <IconButton 
              size="small" 
              sx={{ color: '#aaa', p: 0.5 }} 
              onClick={() => connectWebSocket()}
              title="Reconnect"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: '#aaa', p: 0.5 }} 
              onClick={() => setMinimized(!minimized)}
              title={minimized ? 'Maximize' : 'Minimize'}
            >
              {minimized ? <MaximizeIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: '#aaa', p: 0.5 }} 
              onClick={() => setMessages([])}
              title="Clear logs"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        {!minimized && (
          <Box 
            ref={consoleRef}
            sx={{
              height: 'calc(100% - 32px)',
              overflowY: 'auto',
              p: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#111',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#333',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              }
            }}
          >
            {messages.map((msg, i) => (
              <Typography 
                key={i} 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem',
                  mb: 0.5,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {msg}
              </Typography>
            ))}
          </Box>
        )}
      </Paper>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
} 