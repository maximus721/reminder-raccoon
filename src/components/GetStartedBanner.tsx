
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDescription, Alert } from '@/components/ui/alert';
import { X, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useLanguage } from '@/i18n/context';

const GetStartedBanner = () => {
  const [dismissed, setDismissed] = useLocalStorage('getting-started-dismissed', false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  if (dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
      <Alert className={`
        max-w-3xl mx-4 shadow-lg border-primary/20 bg-[#D3E4FD] animate-slide-up
        ${isMobile ? 'flex flex-col p-3' : ''}
      `}>
        <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex justify-between items-center'}`}>
          <AlertDescription className={`text-sm text-foreground ${isMobile ? 'text-center mb-2' : 'flex-1'}`}>
            <span className="font-medium">{t('newHere')}</span> {t('quickStartGuide')}
          </AlertDescription>
          
          <div className={`${isMobile ? 'flex justify-center w-full' : 'flex items-center gap-2'}`}>
            <a 
              href="https://docs.financetracker.app/guide"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size={isMobile ? "default" : "sm"} className={isMobile ? "w-full mb-1" : "h-8"}>
                <BookOpen className="h-4 w-4 mr-1" />
                {t('getStarted')}
              </Button>
            </a>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default GetStartedBanner;
