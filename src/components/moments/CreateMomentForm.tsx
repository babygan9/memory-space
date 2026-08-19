"use client";

import { useState, useRef } from "react";
import { createMoment, uploadPhoto } from "@/lib/api";

interface CreateMomentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMomentForm({ onClose, onSuccess }: CreateMomentFormProps) {
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = [...photos, ...files].slice(0, 9); // 最多9张
    setPhotos(newPhotos);

    // 生成预览图
    const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);

    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && photos.length === 0) return;

    setIsSubmitting(true);

    try {
      // 上传所有Photo
      const photoUrls: string[] = [];
      for (const file of photos) {
        const url = await uploadPhoto(file);
        if (url) {
          photoUrls.push(url);
        }
      }

      // 创建Post
      const result = await createMoment(content.trim(), photoUrls);

      if (result) {
        onSuccess();
      } else {
        alert("发布失败，请稍后重试");
      }
    } catch (error) {
      console.error("发布失败:", error);
      alert("发布失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-5 border-b border-pixel-brown/10">
          <h2 className="text-lg font-bold text-pixel-brown pixel-text">发布Post</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-pixel-brown/50 hover:text-pixel-brown pixel-text text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* 文字输入 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记录此刻的心情..."
            className="w-full h-32 glass-input pixel-text resize-none"
            disabled={isSubmitting}
          />

          {/* Photo预览 */}
          {photoPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  {!isSubmitting && (
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 添加Photo按钮 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
            disabled={isSubmitting || photos.length >= 9}
          />
          {photos.length < 9 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="mt-4 w-full glass-btn py-3 pixel-text text-pixel-brown/70 font-bold"
            >
              📷 添加Photo ({photos.length}/9)
            </button>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && photos.length === 0)}
            className="mt-6 w-full glass-btn py-3 font-bold text-pixel-brown pixel-text bg-pixel-yellow/40 hover:bg-pixel-yellow/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "发布中..." : "发 布"}
          </button>
        </form>
      </div>
    </div>
  );
}
