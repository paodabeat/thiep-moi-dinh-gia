import React from 'react';
import {Download, Save, FolderOpen, Upload, FileSpreadsheet, Plus, Trash2, ChevronUp, ChevronDown, X, Check, QrCode, RotateCcw, Search, Clapperboard, Image, Square, Play, Info, ExternalLink, TriangleAlert, FolderCheck} from 'lucide-react';
// Bộ biểu tượng lucide-react, cùng độ dày nét cho toàn trang
const L = (C: React.ComponentType<any>, fill = false) => () => <C className="ic" strokeWidth={2.2} absoluteStrokeWidth={false} {...(fill ? {fill: 'currentColor'} : {})} />;
export const Icon = {
  Download: L(Download), Save: L(Save), Folder: L(FolderOpen), Upload: L(Upload), Sheet: L(FileSpreadsheet),
  Plus: L(Plus), Trash: L(Trash2), Up: L(ChevronUp), Down: L(ChevronDown), Caret: L(ChevronDown), Close: L(X),
  Tick: () => <Check className="ic" strokeWidth={3.2} />, Qr: L(QrCode), Reset: L(RotateCcw), Search: L(Search),
  Film: L(Clapperboard), Image: L(Image), Stop: L(Square, true), Play: L(Play, true), Info: L(Info), Ext: L(ExternalLink), Alert: L(TriangleAlert), FolderOk: L(FolderCheck),
};
