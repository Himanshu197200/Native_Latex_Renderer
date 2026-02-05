import { requireNativeView } from 'expo';
import * as React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

import { parseLatex, LatexSegment, hasLatex } from './parseLatex';


interface NativeLatexViewProps {
    latex: string;
    textSize: number;
    textColor: number;
    displayMode: boolean;
    style?: ViewStyle;
    onRenderComplete?: (event: { nativeEvent: { width: number; height: number } }) => void;
    onRenderError?: (event: { nativeEvent: { error: string; latex: string } }) => void;
}


let NativeLatexView: React.ComponentType<NativeLatexViewProps> | null = null;
try {
    NativeLatexView = requireNativeView('LatexView');
} catch (e) {
    console.warn('LatexView native module not available:', e);
}


export interface LatexViewProps {
    
    content: string;
    
    textSize?: number;
    
    textColor?: string;
    
    style?: ViewStyle;
    
    textStyle?: TextStyle;
    
    useFallback?: boolean;
    
    onRenderComplete?: (info: { width: number; height: number }) => void;
    
    onRenderError?: (error: { error: string; latex: string }) => void;
}


function hexToInt(hex: string): number {
    const clean = hex.replace('#', '');
    const value = parseInt(clean, 16);
    if (clean.length === 6) {
        return (0xFF000000 | value) >>> 0;
    }
    return value >>> 0;
}


function LatexViewInner({
    content,
    textSize = 16,
    textColor = '#333333',
    style,
    textStyle,
    useFallback = true, 
    onRenderComplete,
    onRenderError,
}: LatexViewProps) {

    const segments = React.useMemo(() => parseLatex(content), [content]);
    const colorInt = React.useMemo(() => hexToInt(textColor), [textColor]);

    
    if (!hasLatex(content)) {
        return (
            <Text style={[styles.text, textStyle, { fontSize: textSize, color: textColor }]}>
                {content}
            </Text>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {segments.map((segment, index) => (
                <SegmentView
                    key={`${index}-${segment.type}-${segment.content.slice(0, 20)}`}
                    segment={segment}
                    textSize={textSize}
                    textColor={textColor}
                    colorInt={colorInt}
                    textStyle={textStyle}
                    useFallback={useFallback || !NativeLatexView}
                    onRenderComplete={onRenderComplete}
                    onRenderError={onRenderError}
                />
            ))}
        </View>
    );
}

export const LatexView = React.memo(LatexViewInner);


interface SegmentViewProps {
    segment: LatexSegment;
    textSize: number;
    textColor: string;
    colorInt: number;
    textStyle?: TextStyle;
    useFallback: boolean;
    onRenderComplete?: (info: { width: number; height: number }) => void;
    onRenderError?: (error: { error: string; latex: string }) => void;
}

const SegmentView = React.memo(function SegmentView({
    segment,
    textSize,
    textColor,
    colorInt,
    textStyle,
    useFallback,
    onRenderComplete,
    onRenderError,
}: SegmentViewProps) {
    const [nativeFailed, setNativeFailed] = React.useState(false);

    if (segment.type === 'text') {
        return (
            <Text style={[styles.text, textStyle, { fontSize: textSize, color: textColor }]}>
                {segment.content}
            </Text>
        );
    }

    const isBlock = segment.type === 'block';

    
    if (useFallback || !NativeLatexView || nativeFailed) {
        return (
            <FallbackLatexView
                latex={segment.content}
                isBlock={isBlock}
                textSize={textSize}
                textColor={textColor}
            />
        );
    }

    return (
        <View style={[
            isBlock ? styles.blockContainer : styles.inlineContainer,
            { minHeight: textSize * 2 }
        ]}>
            <NativeLatexView
                latex={segment.content}
                textSize={textSize * 2.5}
                textColor={colorInt}
                displayMode={isBlock}
                style={[
                    isBlock ? styles.blockMath : styles.inlineMath,
                    { minHeight: textSize * 2, minWidth: 20 }
                ]}
                onRenderComplete={(e) => onRenderComplete?.(e.nativeEvent)}
                onRenderError={(e) => {
                    setNativeFailed(true);
                    onRenderError?.(e.nativeEvent);
                }}
            />
        </View>
    );
});


interface FallbackLatexViewProps {
    latex: string;
    isBlock: boolean;
    textSize: number;
    textColor: string;
}

const FallbackLatexView = React.memo(function FallbackLatexView({
    latex,
    isBlock,
    textSize,
    textColor,
}: FallbackLatexViewProps) {
    
    const displayLatex = formatLatexForDisplay(latex);

    return (
        <View style={[
            styles.fallbackContainer,
            isBlock ? styles.fallbackBlock : styles.fallbackInline
        ]}>
            <Text style={[
                styles.fallbackText,
                { fontSize: textSize * 0.9, color: textColor }
            ]}>
                {displayLatex}
            </Text>
        </View>
    );
});


function formatLatexForDisplay(latex: string): string {
    let result = latex
        
        .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
        
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/\^n/g, 'ⁿ')
        .replace(/\^\{([^{}]*)\}/g, '^($1)')
        
        .replace(/_\{([^{}]*)\}/g, '[$1]')
        .replace(/_(\d)/g, '[$1]')
        
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\gamma/g, 'γ')
        .replace(/\\delta/g, 'δ')
        .replace(/\\epsilon/g, 'ε')
        .replace(/\\theta/g, 'θ')
        .replace(/\\lambda/g, 'λ')
        .replace(/\\mu/g, 'μ')
        .replace(/\\pi/g, 'π')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\omega/g, 'ω')
        
        .replace(/\\cdot/g, '·')
        .replace(/\\cdots/g, '···')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\neq/g, '≠')
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\approx/g, '≈')
        .replace(/\\infty/g, '∞')
        
        .replace(/\\in/g, '∈')
        .replace(/\\subset/g, '⊂')
        .replace(/\\cup/g, '∪')
        .replace(/\\cap/g, '∩')
        
        .replace(/\\int/g, '∫')
        .replace(/\\sum/g, 'Σ')
        .replace(/\\prod/g, 'Π')
        .replace(/\\partial/g, '∂')
        .replace(/\\nabla/g, '∇')
        
        .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
        .replace(/\\sqrt/g, '√')
        
        .replace(/\\sin/g, 'sin')
        .replace(/\\cos/g, 'cos')
        .replace(/\\tan/g, 'tan')
        .replace(/\\log/g, 'log')
        .replace(/\\ln/g, 'ln')
        
        .replace(/\\,/g, ' ')
        .replace(/\\;/g, ' ')
        .replace(/\\quad/g, '  ')
        .replace(/\\left\(/g, '(')
        .replace(/\\right\)/g, ')')
        .replace(/\\left\[/g, '[')
        .replace(/\\right\]/g, ']')
        .replace(/\\left\{/g, '{')
        .replace(/\\right\}/g, '}')
        .replace(/\\left\|/g, '|')
        .replace(/\\right\|/g, '|')
        
        .replace(/\\([a-zA-Z]+)/g, '$1')
        
        .replace(/\s+/g, ' ')
        .trim();

    return result;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    text: {
        flexShrink: 1,
    },
    blockContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 12,
    },
    inlineContainer: {
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blockMath: {
        alignSelf: 'center',
    },
    inlineMath: {},
    
    fallbackContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    fallbackBlock: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    fallbackInline: {
        marginHorizontal: 2,
    },
    fallbackText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontWeight: '500',
    },
});

export default LatexView;
