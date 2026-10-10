import React from 'react';
import { Search } from 'lucide-react';
import { DESIGN_TOKENS } from '../../tokens';
export const SearchIcon = (props) => { const color = props.color || DESIGN_TOKENS.colors.primary; const size = props.size || 24; const strokeWidth = props.strokeWidth || 2; return React.createElement(Search, { size: size, color: color, strokeWidth: strokeWidth, ...props }); };
