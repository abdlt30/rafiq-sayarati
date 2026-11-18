import { SettingsProvider } from './SettingsContext.jsx';
import { UserProvider } from './UserContext.jsx';
import { CarProvider } from './CarContext.jsx';
import { DashboardProvider } from './DashboardContext.jsx';

export const AppProviders = ({ children }) => {
  return (
    <SettingsProvider>
      <UserProvider>
        <CarProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </CarProvider>
      </UserProvider>
    </SettingsProvider>
  );
};
