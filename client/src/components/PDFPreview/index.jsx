import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'

export function PDFPreview({ open, onOpenChange, blobUrl, title = 'Documento' }) {
  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `${title}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handlePrint = () => {
    if (!blobUrl) return
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = blobUrl
    document.body.appendChild(iframe)
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl h-full sm:h-[90vh] flex flex-col p-0 overflow-hidden border-none sm:border rounded-none sm:rounded-2xl">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b flex-row items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <DialogTitle className="text-[15px] sm:text-lg font-bold truncate max-w-[45%] sm:max-w-none">
            {title}
          </DialogTitle>
          <div className="flex items-center gap-1.5 sm:gap-2 pr-12">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint} 
              className="h-8 px-2 sm:h-9 sm:px-3 gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button 
              onClick={handleDownload} 
              size="sm" 
              className="h-8 px-3 sm:h-9 sm:px-4 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold transition-all active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar PDF</span>
              <span className="sm:hidden text-[13px]">Descargar</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-0 sm:p-4">
          {blobUrl ? (
            <iframe 
              src={`${blobUrl}#view=FitH`} 
              className="w-full h-full border-none sm:border sm:rounded-xl sm:shadow-lg bg-white" 
              title="PDF Preview"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-[14px] font-medium">Generando previsualización...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
