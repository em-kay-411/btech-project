import React, { createContext, useState } from 'react';

const CookieContext = createContext();

export const CookieProvider = ({ children }) => {
  const [cookie, setCookie] = useState(null);

  return (
    <CookieContext.Provider value={{ cookie, setCookie }}>
      {children}
    </CookieContext.Provider>
  );
};

export default CookieContext;
