'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/header';

const companies = [
  'HungryHawk',
  'LiquidThunder', 
  'OutwestSteakhouse',
  'GalacticPizza',
  'PhoenixStateUniversity',
  'CubaTechnologies',
  'PrimeZoom',
  'CampusCash',
  'FitFlexGym'
];

const categories = [
  'general',
  'product-spotlight',
  'promotions', 
  'seasonal',
  'social-media',
  'display-ads',
  'banner-ads'
];

interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

export default function AdImageUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadResult({ success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP allowed.' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadResult({ success: false, error: 'File too large. Max size is 10MB.' });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCompany) {
      setUploadResult({ success: false, error: 'Please select a file and company' });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('company', selectedCompany);
      formData.append('category', selectedCategory);

      const response = await fetch('/api/upload/ad-images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult({ success: true, url: result.url, fileName: result.fileName });
        setSelectedFile(null);
      } else {
        setUploadResult({ success: false, error: result.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({ success: false, error: 'Network error occurred' });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white pt-[68px]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Upload Ad Campaign Images</h1>
            <p className="text-gray-400">Upload images for company ad campaigns to Cloudflare R2</p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Image Upload
              </CardTitle>
              <CardDescription>
                Upload ad campaign images for company pages. Supported formats: JPEG, PNG, WebP (Max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Selection */}
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <Label>Image File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">
                    Drag and drop your image here, or{' '}
                    <label className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
                      browse files
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-400">JPEG, PNG, WebP up to 10MB</p>
                </div>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedCompany || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>

              {/* Upload Result */}
              {uploadResult && (
                <Card className={`${
                  uploadResult.success ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {uploadResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        {uploadResult.success ? (
                          <div>
                            <p className="font-medium text-green-400">Upload successful!</p>
                            <p className="text-sm text-gray-300">File: {uploadResult.fileName}</p>
                            <p className="text-sm text-blue-400 break-all">
                              URL: {uploadResult.url}
                            </p>
                          </div>
                        ) : (
                          <p className="text-red-400">{uploadResult.error}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}