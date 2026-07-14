import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Nurofin-Executive-AI',
  description: 'Enterprise-grade Executive Dashboard and AI Assistant for Nurofin CEO Vincent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('nurofin-theme');
                  var theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  // Apply theme color
                  var savedThemeColor = localStorage.getItem('nurofin-theme-color') || 'blue';
                  var savedCustomColor = localStorage.getItem('nurofin-custom-color') || '#10B981';
                  
                  var colors = {
                    blue: { primary: '#3B82F6', hover: '#2563EB', rgb: '59, 130, 246' },
                    green: { primary: '#10B981', hover: '#059669', rgb: '16, 185, 129' },
                    purple: { primary: '#8B5CF6', hover: '#7C3AED', rgb: '139, 92, 246' },
                    orange: { primary: '#F59E0B', hover: '#D97706', rgb: '245, 158, 11' },
                    red: { primary: '#EF4444', hover: '#DC2626', rgb: '239, 68, 68' }
                  };
                  
                  var selected = colors[savedThemeColor];
                  if (savedThemeColor === 'custom' && savedCustomColor) {
                    var shorthandRegex = /^#?([a-f\\\\d])([a-f\\\\d])([a-f\\\\d])$/i;
                    var fullHex = savedCustomColor.replace(shorthandRegex, function(m, r, g, b) {
                      return r + r + g + g + b + b;
                    });
                    var result = /^#?([a-f\\\\d]{2})([a-f\\\\d]{2})([a-f\\\\d]{2})$/i.exec(fullHex);
                    var rgb = result ? 
                      parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : 
                      '59, 130, 246';
                    selected = { primary: savedCustomColor, hover: savedCustomColor, rgb: rgb };
                  }
                  
                  if (selected) {
                    document.documentElement.style.setProperty('--theme-color', selected.primary);
                    document.documentElement.style.setProperty('--theme-color-hover', selected.hover);
                    document.documentElement.style.setProperty('--theme-color-rgb', selected.rgb);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

