import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Grid,
  FileText,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  src: string;
  className?: string;
  onClose?: () => void;
  showThumbnails?: boolean;
  initialPage?: number;
  initialScale?: number;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  src,
  className,
  onClose,
  showThumbnails = true,
  initialPage = 1,
  initialScale = 1,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(initialScale);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnailPanel, setShowThumbnailPanel] = useState(showThumbnails);
  const [pageInput, setPageInput] = useState(String(initialPage));

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = useCallback((offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      const validPage = Math.min(Math.max(1, newPage), numPages || 1);
      setPageInput(String(validPage));
      return validPage;
    });
  }, [numPages]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.min(Math.max(1, page), numPages || 1);
    setPageNumber(validPage);
    setPageInput(String(validPage));
  }, [numPages]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page)) {
      goToPage(page);
    }
  };

  const handleZoom = useCallback((delta: number) => {
    setScale((prevScale) => Math.min(Math.max(0.5, prevScale + delta), 3));
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [src]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const element = document.getElementById('pdf-viewer-container');
      if (element?.requestFullscreen) {
        element.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div
      id="pdf-viewer-container"
      className={cn(
        'relative w-full h-full bg-background flex',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* 썸네일 패널 */}
      {showThumbnailPanel && (
        <div className="w-48 border-r bg-muted/10 overflow-y-auto">
          <div className="p-2 border-b bg-background sticky top-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">페이지</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowThumbnailPanel(false)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="p-2 space-y-2">
            {numPages &&
              Array.from(new Array(numPages), (el, index) => (
                <button
                  key={`thumb-${index + 1}`}
                  onClick={() => goToPage(index + 1)}
                  className={cn(
                    'relative w-full border rounded overflow-hidden transition-all hover:ring-2 hover:ring-primary',
                    pageNumber === index + 1 && 'ring-2 ring-primary'
                  )}
                >
                  <Document file={src}>
                    <Page
                      pageNumber={index + 1}
                      width={160}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur px-1 py-0.5">
                    <span className="text-xs">{index + 1}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 메인 뷰어 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 컨트롤 바 */}
        <div className="border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {!showThumbnailPanel && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowThumbnailPanel(true)}
                  title="썸네일 보기"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              )}
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(1)}
                  disabled={pageNumber <= 1}
                  title="처음 페이지"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  title="이전 페이지"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                  <Input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    className="w-12 h-8 text-center"
                  />
                  <span className="text-sm text-muted-foreground">
                    / {numPages || 0}
                  </span>
                </form>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= (numPages || 1)}
                  title="다음 페이지"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(numPages || 1)}
                  disabled={pageNumber >= (numPages || 1)}
                  title="마지막 페이지"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom(-0.2)}
                title="축소"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom(0.2)}
                title="확대"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="다운로드"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title="전체 화면"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              
              {onClose && (
                <>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    title="닫기"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PDF 페이지 렌더링 영역 */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <Document
            file={src}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground animate-pulse" />
                <span className="ml-2 text-muted-foreground">PDF 로딩 중...</span>
              </div>
            }
            error={
              <div className="text-destructive">
                PDF를 불러올 수 없습니다.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
