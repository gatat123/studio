// CommentEditor.tsx - Comment creation and editing form
import React, { useState, useRef, useEffect } from 'react';
import { CreateCommentDto, UpdateCommentDto } from '@/types/comment.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  X, 
  Paperclip, 
  AtSign,
  Image as ImageIcon,
  File 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  nickname: string;
  email: string;
  profileImage?: string;
}

interface CommentEditorProps {
  onSubmit: (data: CreateCommentDto) => void;
  onCancel?: () => void;
  position?: { x: number; y: number };
  parentId?: string;  sceneId: string;
  initialContent?: string;
  users?: User[]; // For mentions
  autoFocus?: boolean;
  placeholder?: string;
  submitButtonText?: string;
  className?: string;
}

export function CommentEditor({
  onSubmit,
  onCancel,
  position,
  parentId,
  sceneId,
  initialContent = '',
  users = [],
  autoFocus = true,
  placeholder = 'Write a comment...',
  submitButtonText = 'Send',
  className,
}: CommentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [mentions, setMentions] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(value);
    setCursorPosition(cursorPos);

    // Detect @ mention
    const lastAtIndex = value.lastIndexOf('@', cursorPos);
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1, cursorPos);
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user: User) => {
    const lastAtIndex = content.lastIndexOf('@', cursorPosition);    if (lastAtIndex !== -1) {
      const beforeAt = content.slice(0, lastAtIndex);
      const afterCursor = content.slice(cursorPosition);
      const newContent = `${beforeAt}@${user.nickname} ${afterCursor}`;
      setContent(newContent);
      setMentions([...mentions, user.id]);
      setShowMentions(false);
      
      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = lastAtIndex + user.nickname.length + 2;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && attachments.length === 0) return;
    onSubmit({
      sceneId,
      content: content.trim(),
      position,
      parentId,
      mentions,
      attachments,
    });

    // Reset form
    setContent('');
    setMentions([]);
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(mentionSearch) ||
    user.email.toLowerCase().includes(mentionSearch)
  );

  return (    <div className={cn("w-full space-y-2", className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] pr-10 resize-none"
          autoFocus={autoFocus}
        />
        
        {/* Mention dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full mb-1 left-0 w-full max-h-40 overflow-y-auto bg-white border rounded-md shadow-lg z-10">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleMentionSelect(user)}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.nickname}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white">
                    {user.nickname[0]}
                  </div>
                )}                <div>
                  <div className="font-medium text-sm">{user.nickname}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {file.type.startsWith('image/') ? (
                <ImageIcon className="w-3 h-3 mr-1" />
              ) : (
                <File className="w-3 h-3 mr-1" />
              )}
              <span className="text-xs truncate max-w-[100px]">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="ml-1 p-0.5 hover:bg-gray-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMentions(!showMentions)}
          >
            <AtSign className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() && attachments.length === 0}
          >
            <Send className="w-4 h-4 mr-1" />
            {submitButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}