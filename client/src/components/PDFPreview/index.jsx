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
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between bg-slate-50 dark:bg-slate-900 border-none">
          <DialogTitle className="text-lg flex items-center gap-2">
            Vista Previa: {title}
          </DialogTitle>
          <div className="flex items-center gap-2 mr-6">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
            <Button onClick={handleDownload} size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Descargar PDF
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4">
          {blobUrl ? (
            <iframe 
              src={`${blobUrl}#view=FitH`} 
              className="w-full h-full rounded-md shadow-md border" 
              title="PDF Preview"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Cargando previsualización...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
