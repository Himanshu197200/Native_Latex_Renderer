import { ViewStyle } from 'react-native';

export interface LatexViewProps {
    
    latex: string;
    
    textSize?: number;
    
    textColor?: number;
    
    displayMode?: boolean;
    
    style?: ViewStyle;
    
    onRenderComplete?: (event: { nativeEvent: { width: number; height: number } }) => void;
    
    onRenderError?: (event: { nativeEvent: { error: string; latex: string } }) => void;
}
