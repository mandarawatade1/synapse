import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, Newspaper, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StaggeredMenuProps {
  accentColor?: string;
  className?: string;
}

const StaggeredMenu: React.FC<StaggeredMenuProps> = ({ 
  accentColor = '#c629ff',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Staggered layout variant targeting the dropdown window itself
  const menuVariants = {
    open: {
      clipPath: "inset(0% 0% 0% 0% round 24px)",
      transition: {
        type: "spring" as const,
        bounce: 0,
        duration: 0.5,
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
    closed: {
      clipPath: "inset(10% 20% 90% 80% round 24px)",   // Creates a smooth shrinking collapse effect
      transition: {
        type: "spring" as const,
        bounce: 0,
        duration: 0.3,
      },
    },
  };

  // Staggered drop effect for individual list elements
  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 350, damping: 24 },
    },
    closed: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-surface/80 backdrop-blur-xl border border-border-subtle shadow-lg hover:shadow-xl transition-all text-text-primary z-50 relative"
      >
        <span className="font-bold text-sm tracking-wide mr-1">Menu</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.div>
      </motion.button>

      {/* Dropdown Menu Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            style={{ transformOrigin: "top right" }}
            className="absolute top-[120%] right-0 w-[280px] p-4 bg-surface/90 backdrop-blur-3xl border border-white/10 dark:border-white/5 shadow-2xl z-50 rounded-[24px]"
          >
            <ul className="flex flex-col gap-2">
              <MenuItem 
                icon={<Newspaper size={18} />} 
                text="News" 
                href="#news" 
                accentColor={accentColor} 
                setIsOpen={setIsOpen} 
                itemVariants={itemVariants} 
              />
              <MenuItem 
                icon={<Mail size={18} />} 
                text="Contact" 
                href="#contact" 
                accentColor={accentColor} 
                setIsOpen={setIsOpen} 
                itemVariants={itemVariants} 
              />
              
              <motion.div variants={itemVariants} className="my-2 border-t border-border-subtle/50 mx-2" />
              
              <MenuItem 
                icon={<LogIn size={18} />} 
                text="Log In" 
                href="/login" 
                isRoute 
                accentColor={accentColor} 
                setIsOpen={setIsOpen} 
                itemVariants={itemVariants} 
              />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Invisible backdrop to reliably close menu when clicking outside of it */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};

export default StaggeredMenu;

// Elegant individual dropdown item handler
const MenuItem = ({ icon, text, href, isRoute, accentColor, setIsOpen, itemVariants }: any) => {
  const commonProps = {
    className: "group flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
    onClick: () => setIsOpen(false),
  };

  const InnerContent = (
    <>
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex items-center gap-5 relative z-10 w-full">
        <div 
          className="p-2.5 rounded-xl bg-bg-base/50 dark:bg-black/20 shadow-sm transition-all duration-300 group-hover:scale-110"
          style={{ color: accentColor, boxShadow: `0 4px 14px 0 ${accentColor}15` }}
        >
          {icon}
        </div>
        <span className="font-bold text-lg text-text-primary group-hover:translate-x-1.5 transition-transform duration-300 flex-1 text-left">
          {text}
        </span>
        
        {/* Subtle arrow indicator for interaction */}
        <span 
          className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-bold"
          style={{ color: accentColor }}
        >
          &rarr;
        </span>
      </div>
    </>
  );

  return (
    <motion.li variants={itemVariants} className="list-none w-full">
      {isRoute ? (
        <Link to={href} {...commonProps}>
          {InnerContent}
        </Link>
      ) : (
        <a href={href} {...commonProps}>
          {InnerContent}
        </a>
      )}
    </motion.li>
  );
};
