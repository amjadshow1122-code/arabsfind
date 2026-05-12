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
  X,
  BookOpen,
  Settings,
  Globe
} from 'lucide-react';
import ReactQuill from 'react-quill-new'; // Switch to react-quill-new for React 19 support
import 'react-quill-new/dist/quill.snow.css'; // Import styles
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageOptimization';

const AdminContent = () => {
  const [currentTab, setCurrentTab] = useState('homepage'); 
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Static Pages State
  const [staticPages, setStaticPages] = useState([]);
  const [activePage, setActivePage] = useState(null);

  const fetchContent = async () => {
    setLoading(true);
    const { data: homeData } = await supabase
      .from('homepage_content')
      .select('*')
      .order('section_name', { ascending: true });
    
    if (homeData) {
      setSections(homeData);
      if (homeData.length > 0) setActiveSection(homeData[0]);
    }

    const { data: pageData } = await supabase
      .from('static_pages')
      .select('*')
      .order('title', { ascending: true });
    
    if (pageData) {
      setStaticPages(pageData);
      if (pageData.length > 0) {
        // Only set active page if one isn't already set or if the current one was just deleted
        setActivePage(prev => {
          if (!prev) return pageData[0];
          const exists = pageData.find(p => p.id === prev.id);
          return exists || pageData[0];
        });
      } else {
        setActivePage(null);
      }
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
      const optimizedFile = await optimizeImage(file, 0.8);
      const fileName = `${Math.random()}.webp`;
      const filePath = `hero/${fileName}`;

      const { data, error } = await supabase.storage
        .from('backups')
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

  const handleSaveHomepage = async () => {
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
      alert('Homepage section updated!');
    }
    setIsSaving(false);
  };

  const createNewPage = async () => {
    const title = prompt('Enter page title (e.g. About Us):');
    if (!title) return;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const { data, error } = await supabase
      .from('static_pages')
      .insert([{ title, slug, content: '<h1>New Page Content</h1>', is_published: true }])
      .select();

    if (error) {
      alert('Error creating page: ' + error.message);
    } else {
      setStaticPages([...staticPages, data[0]]);
      setActivePage(data[0]);
    }
  };

  const handleSavePage = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('static_pages')
      .update({ 
        title: activePage.title,
        content: activePage.content,
        is_published: activePage.is_published 
      })
      .eq('id', activePage.id);

    if (error) {
      alert('Error saving page: ' + error.message);
    } else {
      setStaticPages(staticPages.map(p => p.id === activePage.id ? activePage : p));
      alert('Page published successfully!');
    }
    setIsSaving(false);
  };

  const deletePage = async (id) => {
    if (window.confirm('Delete this page forever?')) {
      const { error } = await supabase.from('static_pages').delete().eq('id', id);
      if (error) {
        alert(error.message);
      } else {
        if (activePage?.id === id) setActivePage(null);
        await fetchContent();
      }
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
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
      {/* Tab Switcher */}
      <div className="flex items-center gap-6 border-b border-gray-100">
        <button 
          onClick={() => setCurrentTab('homepage')}
          className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all relative ${currentTab === 'homepage' ? 'text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          Homepage Sections
          {currentTab === 'homepage' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
        </button>
        <button 
          onClick={() => setCurrentTab('pages')}
          className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all relative ${currentTab === 'pages' ? 'text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          Static Pages
          {currentTab === 'pages' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
        </button>
      </div>

      {currentTab === 'homepage' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary">Homepage Editor</h1>
              <p className="text-gray-500 text-sm">Control the visuals of your main storefront.</p>
            </div>
            <button onClick={handleSaveHomepage} disabled={isSaving} className="btn btn-primary px-8 py-2.5 gap-2">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Publish Homepage
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-3">
              {sections.map((section) => (
                <div 
                  key={section.id}
                  onClick={() => setActiveSection(section)}
                  role="button"
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-bold cursor-pointer ${
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
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeSection && (
                  <motion.div key={activeSection.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                      <h3 className="font-heading font-bold text-lg text-primary capitalize">{activeSection.section_name.replace('_', ' ')}</h3>
                      <button 
                        onClick={() => setActiveSection({...activeSection, is_visible: !activeSection.is_visible})}
                        className={`w-10 h-5 rounded-full relative transition-colors ${activeSection.is_visible ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeSection.is_visible ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="p-8 flex flex-col gap-8">
                       {activeSection.section_name === 'hero' ? (
                         <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slider Content</h4>
                              <button onClick={addSlide} className="btn border border-secondary text-secondary hover:bg-secondary/5 px-4 py-1.5 text-[10px] font-bold gap-2"><Plus size={14} /> Add Slide</button>
                            </div>
                            {(activeSection.content.slides || []).map((slide, idx) => (
                              <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                <button onClick={() => removeSlide(idx)} className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="flex flex-col gap-4">
                                    <input type="text" value={slide.title} onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)} className="bg-white border border-transparent focus:border-secondary px-4 py-2 rounded-lg text-sm" placeholder="Title" />
                                    <textarea rows="2" value={slide.subtitle} onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)} className="bg-white border border-transparent focus:border-secondary px-4 py-2 rounded-lg text-sm resize-none" placeholder="Subtitle" />
                                  </div>
                                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 cursor-pointer group/img">
                                    {slide.image && <img src={slide.image} className="w-full h-full object-cover" />}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer"><Upload className="text-white" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, idx)} /></label>
                                  </div>
                                </div>
                              </div>
                            ))}
                         </div>
                       ) : (
                         Object.entries(activeSection.content).map(([key, value]) => (
                           <div key={key} className="flex flex-col gap-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key.replace('_', ' ')}</label>
                             <input type="text" value={value} onChange={(e) => handleUpdateContent(key, e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-secondary px-4 py-3 rounded-xl text-sm outline-none transition-all" />
                           </div>
                         ))
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary">Static Pages</h1>
              <p className="text-gray-500 text-sm">Create and edit articles like About Us or Privacy Policy.</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={createNewPage} className="btn border border-secondary text-secondary hover:bg-secondary/5 px-6 py-2.5 gap-2">
                 <Plus size={18} /> New Page
               </button>
               <button onClick={handleSavePage} disabled={isSaving || !activePage} className="btn btn-primary px-8 py-2.5 gap-2">
                 {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 Save Page
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             <div className="lg:col-span-1 flex flex-col gap-3">
                {staticPages.map(page => (
                  <div 
                    key={page.id}
                    onClick={() => setActivePage(page)}
                    role="button"
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-bold cursor-pointer group ${
                      activePage?.id === page.id 
                        ? 'bg-white border-secondary text-secondary shadow-sm' 
                        : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} />
                      <span className="truncate max-w-[120px]">{page.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={(e) => { e.stopPropagation(); deletePage(page.id); }} className="p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                       <ChevronRight size={14} className={activePage?.id === page.id ? 'opacity-100' : 'opacity-0'} />
                    </div>
                  </div>
                ))}
             </div>

             <div className="lg:col-span-3 flex flex-col gap-6">
                <AnimatePresence mode="wait">
                  {activePage ? (
                    <motion.div key={activePage.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Title</label>
                             <input type="text" value={activePage.title} onChange={(e) => setActivePage({...activePage, title: e.target.value})} className="text-2xl font-heading font-bold text-primary border-none outline-none focus:ring-0 p-0" />
                          </div>
                          <div className="flex items-center gap-4 py-2 border-t border-gray-50 mt-2">
                             <div className="flex items-center gap-2 text-xs text-gray-400">
                               <Globe size={14} />
                               <span>URL: /pages/{activePage.slug}</span>
                             </div>
                             <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs font-bold text-gray-400">Published</span>
                                <button onClick={() => setActivePage({...activePage, is_published: !activePage.is_published})} className={`w-8 h-4 rounded-full relative transition-colors ${activePage.is_published ? 'bg-secondary' : 'bg-gray-200'}`}>
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activePage.is_published ? 'right-0.5' : 'left-0.5'}`} />
                                </button>
                             </div>
                          </div>
                       </div>

                       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                          <ReactQuill 
                            theme="snow" 
                            value={activePage.content} 
                            onChange={(content) => setActivePage({...activePage, content})}
                            modules={quillModules}
                            className="h-[450px]"
                          />
                       </div>
                    </motion.div>
                  ) : (
                    <div className="bg-white p-20 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
                       <BookOpen size={40} className="text-gray-100" />
                       <p className="text-gray-400 italic">Select or create a page to begin editing.</p>
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </>
      )}

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
