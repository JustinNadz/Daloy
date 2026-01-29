import { useEffect, useCallback, useState } from 'react';
import echo, { updateEchoAuth } from '@/lib/echo';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for real-time notifications
 * Listens to user's private channel for notification events
 */
export const useRealTimeNotifications = (userId) => {
    const { toast } = useToast();

    useEffect(() => {
        if (!userId) return;

        // Update Echo authentication
        const token = localStorage.getItem('token');
        if (token) {
            updateEchoAuth(token);
        }

        // Subscribe to user's private channel
        const channel = echo.private(`user.${userId}`);

        // Listen for notification.created event
        channel.listen('.notification.created', (data) => {
            const { notification } = data;

            // Show toast notification
            toast({
                title: notification.data.title || 'New Notification',
                description: notification.data.message || notification.data.content,
                duration: 5000,
            });

            // Play notification sound (optional)
            try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {
                    // Ignore if audio play fails (user interaction required)
                });
            } catch (error) {
                console.warn('Could not play notification sound:', error);
            }

            // Dispatch custom event for notification badge update
            window.dispatchEvent(new CustomEvent('notification:new', { detail: notification }));
        });

        // Cleanup
        return () => {
            channel.stopListening('.notification.created');
            echo.leave(`user.${userId}`);
        };
    }, [userId, toast]);
};

/**
 * Hook for real-time messages
 * Listens to conversation channel for new messages
 */
export const useRealTimeMessages = (conversationId, onMessage) => {
    useEffect(() => {
        if (!conversationId) return;

        // Update Echo authentication
        const token = localStorage.getItem('token');
        if (token) {
            updateEchoAuth(token);
        }

        // Subscribe to conversation channel
        const channel = echo.private(`conversation.${conversationId}`);

        // Listen for message.sent event
        channel.listen('.message.sent', (data) => {
            if (onMessage) {
                onMessage(data.message);
            }

            // Play message sound
            try {
                const audio = new Audio('/message.mp3');
                audio.volume = 0.3;
                audio.play().catch(() => { });
            } catch (error) {
                console.warn('Could not play message sound:', error);
            }
        });

        // Cleanup
        return () => {
            channel.stopListening('.message.sent');
            echo.leave(`conversation.${conversationId}`);
        };
    }, [conversationId, onMessage]);
};

/**
 * Hook for online presence
 * Joins presence channel to see who's online
 */
export const useOnlinePresence = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Update Echo authentication
        const token = localStorage.getItem('token');
        if (!token) return;

        updateEchoAuth(token);

        // Join presence channel
        const channel = echo.join('online');

        // Get initial list of users
        channel.here((users) => {
            setOnlineUsers(users);
        });

        // Listen for users joining
        channel.joining((user) => {
            setOnlineUsers((prev) => [...prev, user]);
        });

        // Listen for users leaving
        channel.leaving((user) => {
            setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
        });

        // Cleanup
        return () => {
            echo.leave('online');
        };
    }, []);

    return onlineUsers;
};

/**
 * Hook for real-time post reactions
 * Listens to post events for likes/reactions
 */
export const usePostReactions = (postId, onReaction) => {
    useEffect(() => {
        if (!postId) return;

        // Subscribe to post channel (public)
        const channel = echo.private(`user.${postId}`);

        // Listen for post.liked event
        channel.listen('.post.liked', (data) => {
            if (onReaction) {
                onReaction(data);
            }
        });

        // Cleanup
        return () => {
            channel.stopListening('.post.liked');
        };
    }, [postId, onReaction]);
};

/**
 * Hook to initialize Echo connection
 * Call this once in your root component
 */
export const useInitializeEcho = (user) => {
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            if (token) {
                updateEchoAuth(token);
                console.log('✅ Echo WebSocket connected');
            }
        }

        return () => {
            // Don't disconnect on unmount, keep connection alive
        };
    }, [user]);
};
