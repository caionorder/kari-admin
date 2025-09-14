// React 19 compatibility layer for react-icons
// This file provides type-safe icon imports that work with React 19

import * as FiIcons from 'react-icons/fi';

// Type assertion helper for React 19 compatibility
const makeIcon = (Icon: any) => Icon as React.FC<{ className?: string }>;

// Fi Icons
export const FiHome = makeIcon(FiIcons.FiHome);
export const FiAward = makeIcon(FiIcons.FiAward);
export const FiUsers = makeIcon(FiIcons.FiUsers);
export const FiBarChart = makeIcon(FiIcons.FiBarChart);
export const FiBarChart2 = makeIcon(FiIcons.FiBarChart2);
export const FiFileText = makeIcon(FiIcons.FiFileText);
export const FiUser = makeIcon(FiIcons.FiUser);
export const FiMenu = makeIcon(FiIcons.FiMenu);
export const FiX = makeIcon(FiIcons.FiX);
export const FiLogOut = makeIcon(FiIcons.FiLogOut);
export const FiCalendar = makeIcon(FiIcons.FiCalendar);
export const FiCheckCircle = makeIcon(FiIcons.FiCheckCircle);
export const FiChevronLeft = makeIcon(FiIcons.FiChevronLeft);
export const FiChevronRight = makeIcon(FiIcons.FiChevronRight);
export const FiChevronsLeft = makeIcon(FiIcons.FiChevronsLeft);
export const FiChevronsRight = makeIcon(FiIcons.FiChevronsRight);
export const FiEdit2 = makeIcon(FiIcons.FiEdit2);
export const FiTrash2 = makeIcon(FiIcons.FiTrash2);
export const FiEye = makeIcon(FiIcons.FiEye);
export const FiPlus = makeIcon(FiIcons.FiPlus);
export const FiSearch = makeIcon(FiIcons.FiSearch);
export const FiFilter = makeIcon(FiIcons.FiFilter);
export const FiDownload = makeIcon(FiIcons.FiDownload);
export const FiUpload = makeIcon(FiIcons.FiUpload);
export const FiSave = makeIcon(FiIcons.FiSave);
export const FiArrowLeft = makeIcon(FiIcons.FiArrowLeft);
export const FiArrowUp = makeIcon(FiIcons.FiArrowUp);
export const FiArrowDown = makeIcon(FiIcons.FiArrowDown);
export const FiRefreshCw = makeIcon(FiIcons.FiRefreshCw);
export const FiClock = makeIcon(FiIcons.FiClock);
export const FiMapPin = makeIcon(FiIcons.FiMapPin);
export const FiDollarSign = makeIcon(FiIcons.FiDollarSign);
export const FiTarget = makeIcon(FiIcons.FiTarget);
export const FiTrendingUp = makeIcon(FiIcons.FiTrendingUp);
export const FiImage = makeIcon(FiIcons.FiImage);
export const FiVideo = makeIcon(FiIcons.FiVideo);
export const FiLock = makeIcon(FiIcons.FiLock);
export const FiMail = makeIcon(FiIcons.FiMail);
export const FiMoreVertical = makeIcon(FiIcons.FiMoreVertical);
export const FiEdit = makeIcon(FiIcons.FiEdit);
export const FiTrash = makeIcon(FiIcons.FiTrash);
export const FiUserPlus = makeIcon(FiIcons.FiUserPlus);
export const FiUserCheck = makeIcon(FiIcons.FiUserCheck);
export const FiBell = makeIcon(FiIcons.FiBell);
export const FiSettings = makeIcon(FiIcons.FiSettings);
export const FiShield = makeIcon(FiIcons.FiShield);
export const FiPhone = makeIcon(FiIcons.FiPhone);
export const FiEyeOff = makeIcon(FiIcons.FiEyeOff);
export const FiType = makeIcon(FiIcons.FiType);
export const FiAlignLeft = makeIcon(FiIcons.FiAlignLeft);
export const FiArrowRight = makeIcon(FiIcons.FiArrowRight);
export const FiAlertCircle = makeIcon(FiIcons.FiAlertCircle);
export const FiActivity = makeIcon(FiIcons.FiActivity);
export const FiStar = makeIcon(FiIcons.FiStar);
export const FiTag = makeIcon(FiIcons.FiTag);
export const FiGift = makeIcon(FiIcons.FiGift);
export const FiInfo = makeIcon(FiIcons.FiInfo);

// Export all other icons that might be needed
export * from 'react-icons/ai';
export * from 'react-icons/bi';
export * from 'react-icons/bs';
