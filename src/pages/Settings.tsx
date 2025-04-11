
import React from 'react';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/theme/ThemeContext';
import { useLanguage } from '@/i18n/context';
import { Sun, Moon, Monitor, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto pt-20 p-4">
        <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('preferences')}</CardTitle>
            <CardDescription>{t('language')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">{t('language')}</Label>
            </div>
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en">{t('english')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="es" id="es" />
                <Label htmlFor="es">{t('spanish')}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('appearance')}</CardTitle>
            <CardDescription>{t('theme')}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={theme} 
              onValueChange={handleThemeChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className={`flex flex-col items-center space-y-2 border rounded-md p-4 hover:bg-accent cursor-pointer ${theme === 'light' ? 'bg-accent/50' : ''}`} 
                   onClick={() => handleThemeChange('light')}>
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="h-6 w-6" />
                <Label htmlFor="light" className="cursor-pointer">{t('light')}</Label>
              </div>

              <div className={`flex flex-col items-center space-y-2 border rounded-md p-4 hover:bg-accent cursor-pointer ${theme === 'dark' ? 'bg-accent/50' : ''}`}
                   onClick={() => handleThemeChange('dark')}>
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="h-6 w-6" />
                <Label htmlFor="dark" className="cursor-pointer">{t('dark')}</Label>
              </div>

              <div className={`flex flex-col items-center space-y-2 border rounded-md p-4 hover:bg-accent cursor-pointer ${theme === 'system' ? 'bg-accent/50' : ''}`}
                   onClick={() => handleThemeChange('system')}>
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <Monitor className="h-6 w-6" />
                <Label htmlFor="system" className="cursor-pointer">{t('system')}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
