import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as RealLucide from 'lucide-react/dist/esm/lucide-react.js';
import * as CustomAnimated from './index.js';

// Fallback re-export for any potential internal utilities
export * from 'lucide-react/dist/esm/lucide-react.js';

// Helper to determine animation behavior by icon name
function getAnimationVariants(name) {
  const n = (name || '').toLowerCase();

  if (n.includes('arrow') && (n.includes('right') || n.includes('next'))) {
    return {
      hover: { x: 3 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('arrow') && (n.includes('left') || n.includes('prev'))) {
    return {
      hover: { x: -3 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('arrow') && n.includes('up')) {
    return {
      hover: { y: -3 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('arrow') && n.includes('down')) {
    return {
      hover: { y: 3 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('chevron') && n.includes('right')) {
    return {
      hover: { x: 2.5 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('chevron') && n.includes('left')) {
    return {
      hover: { x: -2.5 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('chevron') && n.includes('down')) {
    return {
      hover: { y: 2.5 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('chevron') && n.includes('up')) {
    return {
      hover: { y: -2.5 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('refresh') || n.includes('rotate') || n.includes('sync') || n.includes('shuffle')) {
    return {
      hover: { rotate: 180 },
      transition: { duration: 0.45, ease: 'easeInOut' }
    };
  }
  if (n.includes('plus') || n.includes('x') || n.includes('cross') || n.includes('close')) {
    return {
      hover: { rotate: 90, scale: 1.1 },
      transition: { type: 'spring', stiffness: 400, damping: 20 }
    };
  }
  if (n.includes('check')) {
    return {
      hover: { scale: [1, 1.25, 1], rotate: [0, -5, 5, 0] },
      transition: { duration: 0.4, ease: 'easeInOut' }
    };
  }
  if (n.includes('alert') || n.includes('warn') || n.includes('info') || n.includes('help')) {
    return {
      hover: { scale: [1, 1.2, 1], y: [0, -2, 0] },
      transition: { duration: 0.4 }
    };
  }
  if (n.includes('zap') || n.includes('flame') || n.includes('target') || n.includes('award') || n.includes('star')) {
    return {
      hover: { scale: [1, 1.22, 0.95, 1], rotate: [0, -8, 8, 0] },
      transition: { duration: 0.5 }
    };
  }
  if (n.includes('bot') || n.includes('brain') || n.includes('cpu') || n.includes('code') || n.includes('terminal')) {
    return {
      hover: { scale: [1, 1.15, 1], y: [0, -1.5, 0] },
      transition: { duration: 0.4 }
    };
  }
  if (n.includes('external') || n.includes('link') || n.includes('share')) {
    return {
      hover: { x: 2, y: -2 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('copy') || n.includes('download') || n.includes('upload') || n.includes('save') || n.includes('printer')) {
    return {
      hover: { y: -2.5, scale: 1.08 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }
  if (n.includes('building') || n.includes('briefcase') || n.includes('folder') || n.includes('layers') || n.includes('layout')) {
    return {
      hover: { y: -2, scale: 1.08 },
      transition: { type: 'spring', stiffness: 450, damping: 22 }
    };
  }
  if (n.includes('user') || n.includes('phone') || n.includes('mail') || n.includes('message')) {
    return {
      hover: { scale: 1.15, y: -1 },
      transition: { type: 'spring', stiffness: 450, damping: 20 }
    };
  }

  // Default organic spring micro-interaction
  return {
    hover: { scale: 1.15, y: -1.5 },
    transition: { type: 'spring', stiffness: 450, damping: 22 }
  };
}

// Wrapper component to animate any standard icon
export function createAnimatedIcon(OriginalIcon, iconName) {
  if (!OriginalIcon) return () => null;

  const anim = getAnimationVariants(iconName);

  const AnimatedWrapper = forwardRef(({ className = '', style, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.span
        ref={ref}
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ display: 'inline-flex', verticalAlign: 'middle', ...style }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={isHovered ? anim.hover : { x: 0, y: 0, scale: 1, rotate: 0 }}
        transition={anim.transition}
      >
        <OriginalIcon {...props} />
      </motion.span>
    );
  });

  AnimatedWrapper.displayName = `Animated(${iconName})`;
  return AnimatedWrapper;
}

export const AlertCircle = createAnimatedIcon(RealLucide.AlertCircle, 'AlertCircle');
export const AlertTriangle = createAnimatedIcon(RealLucide.AlertTriangle, 'AlertTriangle');
export const ArrowDown = createAnimatedIcon(RealLucide.ArrowDown, 'ArrowDown');
export const ArrowRight = createAnimatedIcon(RealLucide.ArrowRight, 'ArrowRight');
export const ArrowUp = createAnimatedIcon(RealLucide.ArrowUp, 'ArrowUp');
export const ArrowUpRight = createAnimatedIcon(RealLucide.ArrowUpRight, 'ArrowUpRight');
export const Award = createAnimatedIcon(RealLucide.Award, 'Award');
export const BarChart3 = createAnimatedIcon(RealLucide.BarChart3, 'BarChart3');
export const Bell = createAnimatedIcon(RealLucide.Bell, 'Bell');
export const BookOpen = createAnimatedIcon(RealLucide.BookOpen, 'BookOpen');
export const Bookmark = CustomAnimated.BookmarkIcon;
export const BookmarkCheck = createAnimatedIcon(RealLucide.BookmarkCheck, 'BookmarkCheck');
export const Bot = createAnimatedIcon(RealLucide.Bot, 'Bot');
export const Brain = createAnimatedIcon(RealLucide.Brain, 'Brain');
export const BrainCircuit = createAnimatedIcon(RealLucide.BrainCircuit, 'BrainCircuit');
export const Briefcase = createAnimatedIcon(RealLucide.Briefcase, 'Briefcase');
export const Bug = createAnimatedIcon(RealLucide.Bug, 'Bug');
export const Building = createAnimatedIcon(RealLucide.Building, 'Building');
export const Building2 = createAnimatedIcon(RealLucide.Building2, 'Building2');
export const Calendar = CustomAnimated.CalendarIcon;
export const CalendarCheck = createAnimatedIcon(RealLucide.CalendarCheck, 'CalendarCheck');
export const CalendarDays = createAnimatedIcon(RealLucide.CalendarDays, 'CalendarDays');
export const Check = CustomAnimated.CheckIcon;
export const CheckCheck = createAnimatedIcon(RealLucide.CheckCheck, 'CheckCheck');
export const CheckCircle2 = CustomAnimated.CheckCircle2Icon;
export const CheckSquare = createAnimatedIcon(RealLucide.CheckSquare, 'CheckSquare');
export const ChevronDown = createAnimatedIcon(RealLucide.ChevronDown, 'ChevronDown');
export const ChevronLeft = createAnimatedIcon(RealLucide.ChevronLeft, 'ChevronLeft');
export const ChevronRight = createAnimatedIcon(RealLucide.ChevronRight, 'ChevronRight');
export const ChevronUp = createAnimatedIcon(RealLucide.ChevronUp, 'ChevronUp');
export const ChevronsLeft = createAnimatedIcon(RealLucide.ChevronsLeft, 'ChevronsLeft');
export const ChevronsRight = createAnimatedIcon(RealLucide.ChevronsRight, 'ChevronsRight');
export const ClipboardPaste = createAnimatedIcon(RealLucide.ClipboardPaste, 'ClipboardPaste');
export const Clock = createAnimatedIcon(RealLucide.Clock, 'Clock');
export const Cloud = createAnimatedIcon(RealLucide.Cloud, 'Cloud');
export const Code = createAnimatedIcon(RealLucide.Code, 'Code');
export const Code2 = createAnimatedIcon(RealLucide.Code2, 'Code2');
export const Coffee = createAnimatedIcon(RealLucide.Coffee, 'Coffee');
export const Columns = createAnimatedIcon(RealLucide.Columns, 'Columns');
export const Compass = createAnimatedIcon(RealLucide.Compass, 'Compass');
export const Copy = createAnimatedIcon(RealLucide.Copy, 'Copy');
export const Cpu = createAnimatedIcon(RealLucide.Cpu, 'Cpu');
export const Database = createAnimatedIcon(RealLucide.Database, 'Database');
export const DollarSign = createAnimatedIcon(RealLucide.DollarSign, 'DollarSign');
export const Download = createAnimatedIcon(RealLucide.Download, 'Download');
export const Edit3 = createAnimatedIcon(RealLucide.Edit3, 'Edit3');
export const ExternalLink = CustomAnimated.ExternalLinkIcon;
export const Eye = CustomAnimated.EyeIcon;
export const EyeOff = createAnimatedIcon(RealLucide.EyeOff, 'EyeOff');
export const FileCheck = createAnimatedIcon(RealLucide.FileCheck, 'FileCheck');
export const FileCode = createAnimatedIcon(RealLucide.FileCode, 'FileCode');
export const FileCode2 = createAnimatedIcon(RealLucide.FileCode2, 'FileCode2');
export const FileSignature = CustomAnimated.FileSignatureIcon;
export const FileText = createAnimatedIcon(RealLucide.FileText, 'FileText');
export const Files = createAnimatedIcon(RealLucide.Files, 'Files');
export const Filter = createAnimatedIcon(RealLucide.Filter, 'Filter');
export const Flame = createAnimatedIcon(RealLucide.Flame, 'Flame');
export const FolderGit2 = createAnimatedIcon(RealLucide.FolderGit2, 'FolderGit2');
export const FolderKanban = createAnimatedIcon(RealLucide.FolderKanban, 'FolderKanban');
export const Gift = createAnimatedIcon(RealLucide.Gift, 'Gift');
export const GitCommit = createAnimatedIcon(RealLucide.GitCommit, 'GitCommit');
export const Github = createAnimatedIcon(RealLucide.Github, 'Github');
export const Globe = createAnimatedIcon(RealLucide.Globe, 'Globe');
export const GraduationCap = createAnimatedIcon(RealLucide.GraduationCap, 'GraduationCap');
export const Headphones = createAnimatedIcon(RealLucide.Headphones, 'Headphones');
export const HelpCircle = createAnimatedIcon(RealLucide.HelpCircle, 'HelpCircle');
export const History = createAnimatedIcon(RealLucide.History, 'History');
export const Info = createAnimatedIcon(RealLucide.Info, 'Info');
export const Key = createAnimatedIcon(RealLucide.Key, 'Key');
export const Languages = createAnimatedIcon(RealLucide.Languages, 'Languages');
export const Layers = createAnimatedIcon(RealLucide.Layers, 'Layers');
export const Layout = createAnimatedIcon(RealLucide.Layout, 'Layout');
export const Leaf = createAnimatedIcon(RealLucide.Leaf, 'Leaf');
export const Lightbulb = createAnimatedIcon(RealLucide.Lightbulb, 'Lightbulb');
export const LineChart = createAnimatedIcon(RealLucide.LineChart, 'LineChart');
export const Link = createAnimatedIcon(RealLucide.Link, 'Link');
export const Linkedin = createAnimatedIcon(RealLucide.Linkedin, 'Linkedin');
export const List = createAnimatedIcon(RealLucide.List, 'List');
export const Lock = createAnimatedIcon(RealLucide.Lock, 'Lock');
export const LogOut = createAnimatedIcon(RealLucide.LogOut, 'LogOut');
export const Mail = CustomAnimated.MailIcon;
export const MapPin = createAnimatedIcon(RealLucide.MapPin, 'MapPin');
export const Maximize = createAnimatedIcon(RealLucide.Maximize, 'Maximize');
export const Maximize2 = createAnimatedIcon(RealLucide.Maximize2, 'Maximize2');
export const Menu = createAnimatedIcon(RealLucide.Menu, 'Menu');
export const MessageSquare = createAnimatedIcon(RealLucide.MessageSquare, 'MessageSquare');
export const Network = createAnimatedIcon(RealLucide.Network, 'Network');
export const Palette = createAnimatedIcon(RealLucide.Palette, 'Palette');
export const PanelLeftClose = createAnimatedIcon(RealLucide.PanelLeftClose, 'PanelLeftClose');
export const PanelLeftOpen = createAnimatedIcon(RealLucide.PanelLeftOpen, 'PanelLeftOpen');
export const Phone = createAnimatedIcon(RealLucide.Phone, 'Phone');
export const Plus = CustomAnimated.PlusIcon;
export const Printer = createAnimatedIcon(RealLucide.Printer, 'Printer');
export const RefreshCw = CustomAnimated.RefreshCwIcon;
export const RotateCcw = createAnimatedIcon(RealLucide.RotateCcw, 'RotateCcw');
export const RotateCw = createAnimatedIcon(RealLucide.RotateCw, 'RotateCw');
export const Save = createAnimatedIcon(RealLucide.Save, 'Save');
export const Search = CustomAnimated.SearchIcon;
export const Send = CustomAnimated.SendIcon;
export const Server = createAnimatedIcon(RealLucide.Server, 'Server');
export const Shapes = createAnimatedIcon(RealLucide.Shapes, 'Shapes');
export const Share2 = createAnimatedIcon(RealLucide.Share2, 'Share2');
export const Shield = createAnimatedIcon(RealLucide.Shield, 'Shield');
export const ShieldAlert = createAnimatedIcon(RealLucide.ShieldAlert, 'ShieldAlert');
export const ShieldCheck = createAnimatedIcon(RealLucide.ShieldCheck, 'ShieldCheck');
export const Shuffle = createAnimatedIcon(RealLucide.Shuffle, 'Shuffle');
export const Sliders = createAnimatedIcon(RealLucide.Sliders, 'Sliders');
export const SlidersHorizontal = createAnimatedIcon(RealLucide.SlidersHorizontal, 'SlidersHorizontal');
export const Smartphone = createAnimatedIcon(RealLucide.Smartphone, 'Smartphone');
export const Sparkles = CustomAnimated.SparklesIcon;
export const Square = createAnimatedIcon(RealLucide.Square, 'Square');
export const Star = createAnimatedIcon(RealLucide.Star, 'Star');
export const StickyNote = createAnimatedIcon(RealLucide.StickyNote, 'StickyNote');
export const Target = createAnimatedIcon(RealLucide.Target, 'Target');
export const Terminal = createAnimatedIcon(RealLucide.Terminal, 'Terminal');
export const ThumbsUp = createAnimatedIcon(RealLucide.ThumbsUp, 'ThumbsUp');
export const Trash2 = CustomAnimated.Trash2Icon;
export const TrendingUp = createAnimatedIcon(RealLucide.TrendingUp, 'TrendingUp');
export const Upload = createAnimatedIcon(RealLucide.Upload, 'Upload');
export const User = createAnimatedIcon(RealLucide.User, 'User');
export const UserCheck = createAnimatedIcon(RealLucide.UserCheck, 'UserCheck');
export const Users = createAnimatedIcon(RealLucide.Users, 'Users');
export const Volume2 = createAnimatedIcon(RealLucide.Volume2, 'Volume2');
export const VolumeX = createAnimatedIcon(RealLucide.VolumeX, 'VolumeX');
export const Vote = createAnimatedIcon(RealLucide.Vote, 'Vote');
export const Wrench = createAnimatedIcon(RealLucide.Wrench, 'Wrench');
export const X = createAnimatedIcon(RealLucide.X, 'X');
export const XCircle = createAnimatedIcon(RealLucide.XCircle, 'XCircle');
export const Zap = createAnimatedIcon(RealLucide.Zap, 'Zap');
export const ZoomIn = createAnimatedIcon(RealLucide.ZoomIn, 'ZoomIn');
export const ZoomOut = createAnimatedIcon(RealLucide.ZoomOut, 'ZoomOut');
