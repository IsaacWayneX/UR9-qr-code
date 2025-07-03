import React, { useState, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { saveAs } from 'file-saver';
import { SketchPicker } from 'react-color';
import { Download, Upload, QrCode, Palette, Image, Link, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import logo from '../assets/CREATIVE TECH_LOGO 2 copy.png';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Color presets for quick selection
const COLOR_PRESETS = [
  '#000000', '#ffffff', '#1a73e8', '#DC3545', '#28A745', '#FFC107', 
  '#6F42C1', '#17A2B8', '#FD7E14', '#E83E8C', '#20C997', '#6610F2'
];

const QR_STYLES = [
  { key: 'rounded', name: 'Rounded', preview: '●' },
  { key: 'square', name: 'Square', preview: '■' },
  { key: 'dots', name: 'Dots', preview: '•' },
  { key: 'classy', name: 'Classy', preview: '◆' },
  { key: 'classy-rounded', name: 'Classy Rounded', preview: '◇' },
];

const Index = () => {
  // QR Code state
  const [qrValue, setQrValue] = useState('https://ur9group.com');
  const [qrColor, setQrColor] = useState('#1a73e8');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrLogo, setQrLogo] = useState<string | null>(null);
  const [qrStyle, setQrStyle] = useState('rounded');
  const [qrSize, setQrSize] = useState(300);
  // Transparent export state
  const [transparentExport, setTransparentExport] = useState(false);
  
  // UI state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize QR code instance
  useEffect(() => {
    if (!qrCodeRef.current) return;

    qrCodeInstance.current = new QRCodeStyling({
      width: qrSize,
      height: qrSize,
      type: 'canvas',
      data: qrValue,
      dotsOptions: {
        color: qrColor,
        type: qrStyle as any,
      },
      backgroundOptions: {
        color: qrBgColor,
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.3,
        margin: 8,
        crossOrigin: 'anonymous',
      },
      cornersSquareOptions: {
        type: qrStyle as any,
        color: qrColor,
      },
      cornersDotOptions: {
        type: qrStyle as any,
        color: qrColor,
      },
    });

    qrCodeInstance.current.append(qrCodeRef.current);

    return () => {
      if (qrCodeInstance.current && qrCodeRef.current) {
        qrCodeRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update QR code when settings change
  useEffect(() => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        data: qrValue,
        width: qrSize,
        height: qrSize,
        dotsOptions: {
          color: qrColor,
          type: qrStyle as any,
        },
        backgroundOptions: {
          color: qrBgColor,
        },
        cornersSquareOptions: {
          type: qrStyle as any,
          color: qrColor,
        },
        cornersDotOptions: {
          type: qrStyle as any,
          color: qrColor,
        },
        image: qrLogo || undefined,
      });
    }
  }, [qrValue, qrColor, qrBgColor, qrLogo, qrStyle, qrSize]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setQrLogo(e.target?.result as string);
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setQrLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Logo removed');
  };

  const exportQrCode = async (format: 'png' | 'svg') => {
    if (!qrCodeInstance.current) return;
    setIsGenerating(true);
    try {
      const originalBg = qrBgColor;
      if (transparentExport) {
        qrCodeInstance.current.update({ backgroundOptions: { color: 'rgba(0,0,0,0)' } });
      }
      await qrCodeInstance.current.download({
        name: `qrcode-${Date.now()}`,
        extension: format,
      });
      if (transparentExport) {
        qrCodeInstance.current.update({ backgroundOptions: { color: originalBg } });
      }
      toast.success(`QR Code exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const ColorPicker = ({ 
    color, 
    onChange, 
    show, 
    onToggle, 
    label 
  }: {
    color: string;
    onChange: (color: string) => void;
    show: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Palette className="w-4 h-4" />
        {label}
      </Label>
      <div className="relative">
        <div
          onClick={onToggle}
          className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: color }}
        />
        <div className="mt-1 text-xs text-gray-500 font-mono">{color}</div>
        {show && (
          <div className="absolute top-14 left-0 z-50">
            <div className="fixed inset-0" onClick={onToggle} />
            <div className="relative bg-white rounded-lg shadow-xl border">
              <SketchPicker
                color={color}
                onChange={(c) => onChange(c.hex)}
                presetColors={COLOR_PRESETS}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header remains unchanged */}
      <header className="w-full bg-white/80 backdrop-blur border-b border-gray-200 fixed top-0 left-0 z-30">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Site Logo" className="h-10 w-auto rounded bg-black" />
            <span className="font-bold bg-gradient-to-r from-[#B6862C] to-[#FFD700] bg-clip-text text-transparent select-none text-xl md:text-2xl">
              UR9 QR-code generator
            </span>
          </div>
          <Dialog open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-auto" onClick={() => setHowItWorksOpen(true)}>
                How it works
              </Button>
            </DialogTrigger>
            <DialogContent className="px-2 md:px-6">
              <DialogHeader>
                <DialogTitle>How it works</DialogTitle>
                <DialogDescription>
                  <ol className="list-decimal pl-5 space-y-2 mt-4 text-left">
                    <li><b>Enter Content:</b> Type or paste the URL or text you want to encode in the QR code.</li>
                    <li><b>Customize Style:</b> Choose your preferred QR code style, foreground and background colors, and size.</li>
                    <li><b>Add a Logo (Optional):</b> Upload a logo image to embed in the center of your QR code.</li>
                    <li><b>Export:</b> Select your export options (PNG or SVG, with or without transparent background) and download your QR code.</li>
                    <li><b>Scan & Use:</b> Test your QR code with your phone camera, then use it on business cards, marketing materials, or digital content!</li>
                  </ol>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      {/* Hero Section */}
      <section className="pt-32 pb-10 text-center max-w-3xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#B6862C] to-[#FFD700] bg-clip-text text-transparent">
          Generate and Publish <span className="inline-block">QR Codes</span>.
        </h1>
        <p className="text-lg text-black/70 mb-6">
          Create beautiful, customizable QR codes with logos, colors, and styles. Powered by UR9 Creative Tech. Perfect for business cards, marketing materials, and digital content.
        </p>
      </section>
      {/* Main QR Section */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 pb-16">
        {/* Center: URL input and QR preview */}
        <section className="bg-white rounded-lg border p-6 flex flex-col items-center">
          <Label htmlFor="qr-content" className="mb-2 text-black/80">Enter your website URL</Label>
          <Input
            id="qr-content"
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="https://ur9group.com"
            className="mb-4 w-full max-w-md"
          />
          <div className="mb-2 font-semibold text-black/70">Live Preview</div>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-2xl border-2 border-gray-100">
              <div
                ref={qrCodeRef}
                className="flex items-center justify-center"
                style={{ width: `${qrSize}px`, height: `${qrSize}px`, minWidth: `${qrSize}px`, minHeight: `${qrSize}px` }}
              />
            </div>
          </div>
          {/* Logo Upload */}
          <div className="w-full mb-4">
            <Label className="mb-2 block text-black/80">Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border-primary text-primary"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </Button>
              {qrLogo && (
                <Button variant="outline" onClick={removeLogo} size="sm" className="border-primary text-primary">
                  Remove
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            {qrLogo && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Logo Preview:</div>
                <img
                  src={qrLogo}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain border rounded-lg"
                />
              </div>
            )}
          </div>
          {/* Export Options */}
          <div className="w-full">
            <Label className="mb-2 block text-black/80">Export Options</Label>
            <div className="flex items-center gap-2 mb-2">
              <input
                id="transparent-bg"
                type="checkbox"
                checked={transparentExport}
                onChange={e => setTransparentExport(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="transparent-bg" className="text-sm text-black/80 cursor-pointer select-none">
                Export with transparent background
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => exportQrCode('png')}
                disabled={isGenerating}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 border border-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'PNG'}
              </Button>
              <Button
                onClick={() => exportQrCode('svg')}
                disabled={isGenerating}
                variant="outline"
                className="flex-1 border border-primary text-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                SVG
              </Button>
            </div>
          </div>
        </section>
        {/* Right: Pattern and Color selection */}
        <aside className="bg-white rounded-lg border p-6 flex flex-col min-h-[350px]">
          <h2 className="text-lg font-bold mb-4 text-black/80">Pattern</h2>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {QR_STYLES.map((style) => (
              <button
                key={style.key}
                onClick={() => setQrStyle(style.key)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  qrStyle === style.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{style.preview}</div>
                <div className="text-xs">{style.name}</div>
              </button>
            ))}
          </div>
          <h2 className="text-lg font-bold mb-4 text-black/80">Color</h2>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((color, index) => (
              <button
                key={index}
                onClick={() => setQrColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  qrColor === color ? 'border-accent scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </aside>
      </main>
      {/* Footer */}
      <footer className="text-center mt-12 pt-8 border-t border-gray-200 px-4">
        <p className="text-gray-500">
          From UR9 Creative Tech for UR9 Group
        </p>
      </footer>
    </div>
  );
};

export default Index;
