import React, { useState, useEffect, useRef } from 'react';
import 'smartmenus';
import 'smartmenus/dist/css/sm-blue/sm-blue.css';
import 'smartmenus/dist/css/sm-core-css.css';
import './AppMenu.css';
import $ from 'jquery';
import menuList from './MenuList.json';

const AppMenu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRenewalDiff, setRenewalDiff] = useState(null);
  const [userName, setUserName] = useState(null);
  const mainMenuRef = useRef(null);

  // Fetch user data and renewal info once
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://dev.icharts.in/opt/api/getuserName_Api.php');
        const data = await response.json();
        if (data) {
          setIsLoggedIn(true);
          setUserName(data);
          const renewalDiff = await getRenewalDate(data);
          setRenewalDiff(renewalDiff ? parseInt(renewalDiff, 10) : null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const getRenewalDate = async (userName) => {
      try {
        const pageName = window.location.pathname.split('/').pop();
        const postData = new URLSearchParams({ un: userName, pageName }).toString();
        const response = await fetch('https://dev.icharts.in/opt/hcharts/stx8req/php/getRenewalDate_SB.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: postData,
        });
        const result = await response.json();
        return result?.[2] ?? null;
      } catch (error) {
        console.error('Error fetching renewal date:', error);
        return null;
      }
    };

    fetchUserData();
  }, []);

  // Initialize SmartMenus once
  useEffect(() => {
    if (menuList && mainMenuRef.current && !$(mainMenuRef.current).data('smartmenus')) {
      $(mainMenuRef.current).smartmenus({
        subMenusSubOffsetX: 1,
        subMenusSubOffsetY: -8,
        showTimeout: 10,
        hideTimeout: 10,
      });
    }

    return () => {
      if (mainMenuRef.current) {
        $(mainMenuRef.current).smartmenus('destroy');
      }
    };
  }, []);

  // Render submenu recursively
  const renderSubMenu = (subMenuItems) =>
    subMenuItems?.length ? (
      <ul>
        {subMenuItems.map((item, index) => (
          <li key={index}>
            <a href={item.url}>
              {item.label}
              {item.img && <img src={item.img} alt={item.label} className="new-icon" />}
            </a>
            {renderSubMenu(item['sub-menu'])}
          </li>
        ))}
      </ul>
    ) : null;

  // Render main menu
  const renderMenu = () =>
    menuList?.['main-menu']?.items.map((menuItem, index) => {
      if ((menuItem.id === 'Login' && isLoggedIn) || (menuItem.id === 'Logout' && !isLoggedIn)) return null;
      if (menuItem.id === 'renewalNotification' && isRenewalDiff > 2) return null;

      return (
        <li key={index} className={menuItem.class}>
          <a href={menuItem.url}>
            {menuItem.label}
            {menuItem.id === 'renewalNotification' && (
              <span id="ExpiryBadge" className="bellnote" title="Subscription Renewal Reminder">
                {isRenewalDiff}
              </span>
            )}
          </a>
          {renderSubMenu(menuItem['sub-menu'])}
        </li>
      );
    });

  return (
    <nav id="main-nav">
      <input id="main-menu-state" type="checkbox" />
      <label className="main-menu-btn" htmlFor="main-menu-state">
        <span className="main-menu-btn-icon"></span> Toggle main menu visibility
      </label>
      <ul ref={mainMenuRef} id="main-menu" className="sm sm-blue">
        {renderMenu()}
      </ul>
    </nav>
  );
};

export default AppMenu;
