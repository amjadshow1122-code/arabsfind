import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Save, 
  Loader2,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  Upload,
  ChevronLeft,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageOptimization';

const AdminContent = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('homepage_content')
      .select('*')
      .order('section_name', { ascending: true });
    
    if (data) {
      setSections(data);
      if (data.length > 0) setActiveSection(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleUpdateContent = (field, value) => {
    setActiveSection({
      ...activeSection,
      content: { ...activeSection.content, [field]: value }
    });
  };

  const handleUpdateSlide = (index, field, value) => {
    const newSlides = [...activeSection.content.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setActiveSection({
      ...activeSection,
      content: { ...activeSection.content, slides: newSlides }
    });
  };

  const addSlide = () => {
    const newSlides = [
      ...(activeSection.content.slides || []),
      { title: 'New Slide Title', subtitle: 'New Slide Subtitle', image: '', cta_text: 'Shop Now' }
    ];
    setActiveSection({
      ...activeSection,
      content: { ...activeSection.content, slides: newSlides }
    });
  };

  const removeSlide = (index) => {
    const newSlides = activeSection.content.slides.filter((_, i) => i !== index);
    setActiveSection({
      ...activeSection,
      content: { ...activeSection.content, slides: newSlides }
    });
  };

  const handleImageUpload = async (e, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Optimize image to WebP before upload
      const optimizedFile = await optimizeImage(file, 0.8);

      const fileName = `${Math.random()}.webp`;
      const filePath = `hero/${fileName}`;

      const { data, error } = await supabase.storage
        .from('backups') // Using existing bucket for simplicity, or create 'content' bucket
        .upload(filePath, optimizedFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('backups')
        .getPublicUrl(filePath);

      if (index !== null) {
        handleUpdateSlide(index, 'image', publicUrl);
      } else {
        handleUpdateContent('bg_image', publicUrl);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('homepage_content')
      .update({ 
        content: activeSection.content,
        is_visible: activeSection.is_visible 
      })
      .eq('id', activeSection.id);

    if (error) {
      alert('Error saving content: ' + error.message);
    } else {
      setSections(sections.map(s => s.id === activeSection.id ? activeSection : s));
      alert('Homepage content updated and live!');
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Content Management</h1>
          <p className="text-gray-500 text-sm">Control your storefront's visual storytelling and layout.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving || !activeSection}
            className="btn btn-primary px-8 py-2.5 gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sections Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {sections.map((section) => (
            <button 
              key={section.id}
              onClick={() => setActiveSection(section)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-bold ${
                activeSection?.id === section.id 
                  ? 'bg-white border-secondary text-secondary shadow-sm' 
                  : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layout size={18} />
                <span className="capitalize">{section.section_name.replace('_', ' ')}</span>
              </div>
              <ChevronRight size={14} className={activeSection?.id === section.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Section Editor */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeSection && (
              <motion.div 
                key={activeSection.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-secondary" />
                    <h3 className="font-heading font-bold text-lg text-primary capitalize">
                      Editing: {activeSection.section_name.replace('_', ' ')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                      <button 
                        onClick={() => setActiveSection({...activeSection, is_visible: !activeSection.is_visible})}
                        className={`w-10 h-5 rounded-full relative transition-colors ${activeSection.is_visible ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeSection.is_visible ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col gap-8">
                  {/* HERO SLIDER SPECIFIC EDITOR */}
                  {activeSection.section_name === 'hero' ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Heritage Slides</h4>
                        <button onClick={addSlide} className="btn border border-secondary text-secondary hover:bg-secondary/5 px-4 py-1.5 text-[10px] font-bold gap-2">
                          <Plus size={14} /> Add Slide
                        </button>
                      </div>

                      <div className="flex flex-col gap-4">
                        {(activeSection.content.slides || []).map((slide, idx) => (
                          <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                            <button onClick={() => removeSlide(idx)} className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slide Title</label>
                                  <input type="text" value={slide.title} onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)} className="bg-white border border-transparent focus:border-secondary px-4 py-2 rounded-lg text-sm" />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slide Subtitle</label>
                                  <textarea rows="2" value={slide.subtitle} onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)} className="bg-white border border-transparent focus:border-secondary px-4 py-2 rounded-lg text-sm resize-none" />
                                </div>
                              </div>
                              <div className="flex flex-col gap-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Background Image</label>
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300">
                                  {slide.image ? (
                                    <img src={slide.image} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                      <ImageIcon size={32} />
                                      <span className="text-[10px] font-bold mt-2">No Image</span>
                                    </div>
                                  )}
                                  <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, idx)} />
                                    <Upload className="text-white" />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* GENERIC CONTENT EDITOR */
                    Object.entries(activeSection.content).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{key.replace('_', ' ')}</label>
                        {key.includes('image') ? (
                          <div className="flex items-center gap-4">
                             <input type="text" value={value} onChange={(e) => handleUpdateContent(key, e.target.value)} className="flex-grow bg-gray-50 border border-transparent px-4 py-3 rounded-xl text-sm outline-none" />
                             <label className="btn border border-gray-200 text-primary px-4 py-3 cursor-pointer">
                               <Upload size={18} />
                               <input type="file" className="hidden" onChange={(e) => handleImageUpload(e)} />
                             </label>
                          </div>
                        ) : typeof value === 'string' && value.length > 50 ? (
                          <textarea rows="4" value={value} onChange={(e) => handleUpdateContent(key, e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-secondary px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none" />
                        ) : (
                          <input type="text" value={value} onChange={(e) => handleUpdateContent(key, e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-secondary px-4 py-3 rounded-xl text-sm outline-none transition-all" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex items-center gap-4">
            <Loader2 className="animate-spin text-secondary" />
            <span className="font-bold text-primary">Uploading image to vault...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
