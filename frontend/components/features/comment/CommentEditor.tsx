'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, AtSign, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/features/auth/hooks/useAuth';

interface CommentEditorProps {
  onSubmit: (data: {
    content: string;
    mentions?: string[];
    attachments?: File[];
    position?: { x: number; y: number };
  }) => Promise<void>;
  onCancel?: () => void;
  parentId?: string;
  position?: { x: number; y: number };
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CommentEditor({
  onSubmit,
  onCancel,
  parentId,
  position,
  placeholder = '댓글을 입력하세요...',
  autoFocus = false,
  className,
}: CommentEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  // 파일 제거
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 멘션 처리
  const handleMention = (userId: string, userName: string) => {
    setContent(prev => prev + `@${userName} `);
    setMentions(prev => [...prev, userId]);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // 제출 처리
  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        mentions: mentions.length > 0 ? mentions : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        position,
      });

      // 초기화
      setContent('');
      setMentions([]);
      setAttachments([]);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 키보드 단축키
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === '@') {
      setShowMentions(true);
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* 사용자 정보 */}
      <div className="flex items-center space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.avatar} alt={user?.nickname} />
          <AvatarFallback>
            {user?.nickname?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user?.nickname}</span>
      </div>

      {/* 입력 영역 */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="min-h-[100px] resize-none pr-12"
          disabled={isSubmitting}
        />
        
        {/* 파일 첨부 버튼 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* 첨부 파일 미리보기 */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {file.type.startsWith('image/') ? (
                <Image className="w-3 h-3" />
              ) : (
                <Paperclip className="w-3 h-3" />
              )}
              <span className="text-xs truncate max-w-[100px]">
                {file.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-4 h-4 p-0 hover:bg-transparent"
                onClick={() => removeAttachment(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 멘션 버튼 */}
          <Popover open={showMentions} onOpenChange={setShowMentions}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
              >
                <AtSign className="w-4 h-4 mr-1" />
                멘션
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1">
              <div className="space-y-1">
                {/* 실제로는 프로젝트 멤버 목록을 가져와야 함 */}
                <button
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left"
                  onClick={() => handleMention('user1', 'User1')}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">User1</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <span className="text-xs text-muted-foreground">
            Ctrl + Enter로 전송
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          
          <Button
            onClick={handleSubmit}
            size="sm"
            disabled={isSubmitting || (!content.trim() && attachments.length === 0)}
          >
            <Send className="w-4 h-4 mr-1" />
            전송
          </Button>
        </div>
      </div>
    </div>
  );
}