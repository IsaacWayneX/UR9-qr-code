
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
  const [qrValue, setQrValue] = useState('https://lovable.dev');
  const [qrColor, setQrColor] = useState('#1a73e8');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrLogo, setQrLogo] = useState<string | null>(null);
  const [qrStyle, setQrStyle] = useState('rounded');
  const [qrSize, setQrSize] = useState(300);
  
  // UI state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
      await qrCodeInstance.current.download({
        name: `qrcode-${Date.now()}`,
        extension: format,
      });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QR Code Studio
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create beautiful, customizable QR codes with logos, colors, and styles. 
            Perfect for business cards, marketing materials, and digital content.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Content Input */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  QR Code Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="qr-content">URL or Text</Label>
                  <Input
                    id="qr-content"
                    value={qrValue}
                    onChange={(e) => setQrValue(e.target.value)}
                    placeholder="Enter URL or text to encode"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Style Options */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Style & Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Style Selection */}
                <div>
                  <Label className="mb-3 block">QR Code Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {QR_STYLES.map((style) => (
                      <button
                        key={style.key}
                        onClick={() => setQrStyle(style.key)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          qrStyle === style.key
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{style.preview}</div>
                        <div className="text-xs">{style.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Color Controls */}
                <div className="grid grid-cols-2 gap-6">
                  <ColorPicker
                    color={qrColor}
                    onChange={setQrColor}
                    show={showColorPicker}
                    onToggle={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowBgColorPicker(false);
                    }}
                    label="Foreground"
                  />
                  <ColorPicker
                    color={qrBgColor}
                    onChange={setQrBgColor}
                    show={showBgColorPicker}
                    onToggle={() => {
                      setShowBgColorPicker(!showBgColorPicker);
                      setShowColorPicker(false);
                    }}
                    label="Background"
                  />
                </div>

                {/* Color Presets */}
                <div>
                  <Label className="mb-3 block">Quick Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setQrColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          qrColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Control */}
                <div>
                  <Label className="mb-2 block">Size: {qrSize}px</Label>
                  <input
                    type="range"
                    min="200"
                    max="500"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Logo (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                  {qrLogo && (
                    <Button variant="outline" onClick={removeLogo} size="sm">
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
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => exportQrCode('png')}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'PNG'}
                  </Button>
                  <Button
                    onClick={() => exportQrCode('svg')}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    SVG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Preview */}
          <div className="lg:sticky lg:top-8">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-2xl shadow-inner border-2 border-gray-100">
                    <div
                      ref={qrCodeRef}
                      className="flex items-center justify-center"
                      style={{ 
                        width: `${qrSize}px`, 
                        height: `${qrSize}px`,
                        minWidth: `${qrSize}px`,
                        minHeight: `${qrSize}px`
                      }}
                    />
                  </div>
                </div>
                <div className="mt-6 text-center text-sm text-gray-500">
                  Scan with your phone camera to test
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Created with ❤️ using React, Vite, and qr-code-styling
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
