import { useState, useEffect, useRef } from 'react';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import { Close as CloseIcon, DragIndicator as DragIcon } from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Import Draggable component
const Draggable = dynamic(() => import('react-draggable'), { ssr: false });

// Our client-side only component
function ConsoleComponent() {
  const [messages, setMessages] = useState(['Console initialized']);
  const [connected, setConnected] = useState(false);
  const consoleRef = useRef(null);
  
  // WebSocket connection
  useEffect(() => {
    console.log('Console mounted');
    
    try {
      const ws = new WebSocket(`ws://localhost:5000/ws/logs`);
      
      ws.onopen = () => {
        setConnected(true);
        setMessages(prev => [...prev, 'WebSocket connected']);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, data.message]);
          
          // Auto-scroll
          if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
          }
        } catch (e) {
          setMessages(prev => [...prev, `Error parsing: ${event.data}`]);
        }
      };
      
      ws.onerror = () => {
        setConnected(false);
        setMessages(prev => [...prev, 'WebSocket error']);
      };
      
      ws.onclose = () => {
        setConnected(false);
        setMessages(prev => [...prev, 'WebSocket closed']);
      };
      
      return () => ws.close();
    } catch (error) {
      setMessages(prev => [...prev, `WebSocket setup error: ${error.message}`]);
    }
  }, []);
  
  // Add this function to color-code log messages
  const formatMessageWithColors = (msg) => {
    if (typeof msg !== 'string') return msg;
    
    // Add color coding for common log patterns
    return msg
      .replace(/error|exception|failed|failure/gi, match => `<span style="color: #ff5555;">${match}</span>`)
      .replace(/warning|warn/gi, match => `<span style="color: #ffaa55;">${match}</span>`)
      .replace(/success|completed|done/gi, match => `<span style="color: #55ff55;">${match}</span>`)
      .replace(/starting|begin|analyzing/gi, match => `<span style="color: #55aaff;">${match}</span>`);
  }
  
  return (
    <Draggable
      handle=".console-handle"
      defaultPosition={{ x: 20, y: 20 }}
    >
      <Paper 
        elevation={5}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 550,  // Wider for more content
          height: 400,  // Taller to see more logs
          zIndex: 9999,
          overflow: 'hidden',
          backgroundColor: '#101010', // Slightly lighter black for better readability
          color: '#33ff33', // Brighter green
          border: '2px solid #33ff33', // Green terminal-style border
          borderRadius: '4px',
          fontFamily: 'Consolas, monospace',
          boxShadow: '0 0 15px rgba(0, 50, 0, 0.5)' // Subtle green glow
        }}
      >
        <Box 
          className="console-handle"
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            bgcolor: '#002200', // Dark green header
            p: 1,
            cursor: 'move'
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
            Hedge Fund AI Console {connected ? '(Connected)' : '(Disconnected)'}
          </Typography>
          <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setMessages([])}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box 
          ref={consoleRef}
          sx={{ 
            height: 'calc(100% - 40px)', 
            overflowY: 'auto', 
            p: 1 
          }}
        >
          {messages.map((msg, i) => (
            <Typography key={i} variant="body2" sx={{ fontSize: '12px' }}
              dangerouslySetInnerHTML={{ __html: formatMessageWithColors(msg) }}
            />
          ))}
        </Box>
      </Paper>
    </Draggable>
  );
}

// Export with SSR disabled
export default dynamic(() => Promise.resolve(ConsoleComponent), { ssr: false }); 