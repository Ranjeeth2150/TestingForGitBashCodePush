import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Checkbox } from "primereact/checkbox";
import SettingsIcon from '@mui/icons-material/Settings';

const SettingSelector = ({ columns, selectedSetting, onSettingToggle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const settingRef = useRef(null);

  const toggleSettings = () => {
    setIsVisible((prev) => !prev);
  };

  // useCallback to avoid recreating this function on each render
  const handleClickOutside = useCallback((event) => {
    if (settingRef.current && !settingRef.current.contains(event.target)) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className="SettingSelector" ref={settingRef}>
      {/* Settings icon button */}
      <button 
        className="p-button p-component select-column"
        onClick={toggleSettings} 
        title="Add On"
      >
        <SettingsIcon />
      </button>

      {/* Toggle settings visibility */}
      {isVisible && (
        <ul className="ColVis_collection" style={{ position: "absolute", whiteSpace: "nowrap", zIndex: 999 }}>
          {columns.map((col) => (
            <li key={col.field}>
              <label className="pure-material-checkbox">
                <Checkbox
                  inputId={col.field}
                  value={col.field}
                  onChange={onSettingToggle}
                  checked={selectedSetting[col.field]}
                />
                <span>{col.header}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SettingSelector;
