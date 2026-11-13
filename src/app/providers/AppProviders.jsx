import { AppContextProvider } from '../../context/AppContext'; // تأكد من اسم التصدير في ملفك

export default function AppProviders({ children }) {
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  );
}
