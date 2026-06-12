import React from 'react';
import { motion } from 'framer-motion';

const OrderSettingsTab = ({ settings, setSettings }) => {
  const handleToggle = (key, configKey = 'whatsapp_order') => {
    setSettings(prev => ({
      ...prev,
      footer_config: {
        ...prev.footer_config,
        [configKey]: {
          ...prev.footer_config[configKey],
          [key]: !prev.footer_config[configKey]?.[key]
        }
      }
    }));
  };

  const handleStringChange = (key, value, configKey = 'whatsapp_order') => {
    setSettings(prev => ({
      ...prev,
      footer_config: {
        ...prev.footer_config,
        [configKey]: {
          ...prev.footer_config[configKey],
          [key]: value
        }
      }
    }));
  };

  const whatsappEnabled = settings.footer_config?.whatsapp_order?.enabled ?? false;
  const whatsappNumber = settings.footer_config?.whatsapp_order?.number ?? '+923175587278';

  const widgetEnabled = settings.footer_config?.whatsapp_widget?.enabled ?? false;
  const widgetNumber = settings.footer_config?.whatsapp_widget?.number ?? '+923175587278';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      <div className="bg-white rounded-2xl border p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">WhatsApp Order Settings</h2>
          <p className="text-sm text-gray-500">Configure whether customers can place orders directly via WhatsApp.</p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${whatsappEnabled ? 'bg-secondary' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${whatsappEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={whatsappEnabled}
              onChange={() => handleToggle('enabled')}
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm">Enable WhatsApp Orders</span>
              <span className="text-xs text-gray-500">Show a WhatsApp order button on the product details page.</span>
            </div>
          </label>

          {whatsappEnabled && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-bold text-gray-700">WhatsApp Number</label>
              <input 
                type="text" 
                value={whatsappNumber}
                onChange={(e) => handleStringChange('number', e.target.value)}
                className="input"
                placeholder="+923175587278"
              />
              <p className="text-xs text-gray-500">Include country code (e.g. +923175587278). The customer's message will be sent here.</p>
            </div>
          )}
        </div>

        {/* Separator */}
        <hr className="border-gray-100" />

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">WhatsApp Contact Widget</h2>
          <p className="text-sm text-gray-500">Configure the floating WhatsApp contact icon displayed on all pages.</p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${widgetEnabled ? 'bg-secondary' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${widgetEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={widgetEnabled}
              onChange={() => handleToggle('enabled', 'whatsapp_widget')}
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm">Enable Contact Widget</span>
              <span className="text-xs text-gray-500">Show a floating WhatsApp chat button in the bottom corner of the site.</span>
            </div>
          </label>

          {widgetEnabled && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-bold text-gray-700">Widget WhatsApp Number</label>
              <input 
                type="text" 
                value={widgetNumber}
                onChange={(e) => handleStringChange('number', e.target.value, 'whatsapp_widget')}
                className="input"
                placeholder="+923175587278"
              />
              <p className="text-xs text-gray-500">Number for general customer support inquiries.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSettingsTab;
