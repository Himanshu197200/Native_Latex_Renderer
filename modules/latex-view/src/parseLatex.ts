

export type SegmentType = 'text' | 'inline' | 'block';

export interface LatexSegment {
    type: SegmentType;
    content: string;
}


export function parseLatex(input: string): LatexSegment[] {
    if (!input || input.trim() === '') {
        return [];
    }

    const segments: LatexSegment[] = [];
    let remaining = input;

    while (remaining.length > 0) {
        
        const blockMatch = remaining.match(/^\$\$([\s\S]*?)\$\$/);
        if (blockMatch) {
            const latex = blockMatch[1].trim();
            if (latex) {
                segments.push({ type: 'block', content: latex });
            }
            remaining = remaining.slice(blockMatch[0].length);
            continue;
        }

        
        const inlineMatch = remaining.match(/^\$(?!\d+(?:\.\d+)?(?:\s|$|,|\.(?!\d)))([^\$]+?)\$/);
        if (inlineMatch) {
            const latex = inlineMatch[1].trim();
            if (latex) {
                segments.push({ type: 'inline', content: latex });
            }
            remaining = remaining.slice(inlineMatch[0].length);
            continue;
        }

        
        const nextDollar = remaining.search(/\$(?!\d+(?:\.\d+)?(?:\s|$|,|\.(?!\d)))/);

        if (nextDollar === -1) {
            
            if (remaining.trim()) {
                segments.push({ type: 'text', content: remaining });
            }
            break;
        } else if (nextDollar === 0) {
            
            
            const textEnd = remaining.indexOf(' ', 1);
            const textPart = textEnd > 0 ? remaining.slice(0, textEnd + 1) : remaining.slice(0, 1);
            segments.push({ type: 'text', content: textPart });
            remaining = remaining.slice(textPart.length);
        } else {
            
            const textPart = remaining.slice(0, nextDollar);
            if (textPart.trim()) {
                segments.push({ type: 'text', content: textPart });
            } else if (textPart) {
                
                segments.push({ type: 'text', content: textPart });
            }
            remaining = remaining.slice(nextDollar);
        }
    }

    
    return mergeConsecutiveTextSegments(segments);
}


function mergeConsecutiveTextSegments(segments: LatexSegment[]): LatexSegment[] {
    const merged: LatexSegment[] = [];

    for (const segment of segments) {
        const last = merged[merged.length - 1];
        if (last && last.type === 'text' && segment.type === 'text') {
            last.content += segment.content;
        } else {
            merged.push({ ...segment });
        }
    }

    return merged;
}


export function hasLatex(input: string): boolean {
    
    return /\$\$/.test(input) || /\$(?!\d+(?:\.\d+)?(?:\s|$|,))/.test(input);
}
