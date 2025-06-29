import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ModuleTabs = ({ tabs, basePath }) => {
  return (
    <nav className="flex items-center space-x-4 border-b">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={`${basePath}${tab.to}`}
          end={tab.to === ''} // `end` prop for the base path to not stay active
          className={({ isActive }) =>
            cn(
              'px-3 py-2 font-medium text-sm rounded-t-md transition-colors',
              isActive
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default ModuleTabs;
