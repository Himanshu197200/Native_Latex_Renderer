import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import { LatexView } from './modules/latex-view';


const SAMPLE_DATA = [
  {
    id: '1',
    content: `This question is straightforward. Let's solve it step by step.
Remember: speed = distance / time.`,
  },
  {
    id: '2',
    content: `The formula for speed is $v = \\frac{d}{t}$.
We know that $a^2 + b^2 = c^2$ from the Pythagorean theorem.`,
  },
  {
    id: '3',
    content: `If $x > 0$ and $x \\neq 1$, then $\\log x$ is defined and $x^n$ grows exponentially.`,
  },
  {
    id: '4',
    content: `To calculate the area, we integrate the function:
$$
A = \\int_a^b f(x)\\,dx
$$
Now substitute the limits.`,
  },
  {
    id: '5',
    content: `Consider the function $f(x) = \\frac{(x^2 + 3x + 5)(x^3 - 2x + 7)(x^4 + x^2 + 1)}{(x - 1)(x + 2)(x^2 + x + 1)}$ and analyze its behavior.`,
  },
  {
    id: '6',
    content: `We now simplify $ \\frac{(a_1 + a_2 + a_3 + \\cdots + a_n)^2}{\\sqrt{(b_1^2 + b_2^2 + \\cdots + b_n^2)(c_1^2 + c_2^2 + \\cdots + c_n^2)}} $ before proceeding further in the solution.`,
  },
  {
    id: '7',
    content: `$\\left(a_1 + a_2 + a_3 + a_4 + a_5 + a_6 + a_7 + a_8 + a_9 + a_{10} + a_{11} + a_{12} + a_{13} + a_{14} + a_{15} + a_{16} + a_{17} + a_{18} + a_{19} + a_{20} + a_{21} + a_{22} + a_{23} + a_{24} + a_{25} + \\cdots + a_n \\right)^2$`,
  },
  {
    id: '8',
    content: `Using the identities:
$$
\\sin^2 x + \\cos^2 x = 1
$$
and
$$
\\tan x = \\frac{\\sin x}{\\cos x}
$$
we can derive the result.`,
  },
  {
    id: '9',
    content: `Let's solve this step by step.
First, recall the identity $a^2 - b^2 = (a-b)(a+b)$.
Now apply it to the expression:
$$
x^2 - 9
$$
Finally, factorize and simplify.`,
  },
  {
    id: '10',
    content: `This expression is wrong: $ \\frac{a+b }{ c $ and should not crash.`,
  },
  {
    id: '11',
    content: `Try rendering this: $ \\sqrt{2 + $ which is invalid.`,
  },
  {
    id: '12',
    content: `Here is something unsupported: $ \\unknowncommand{x} $.`,
  },
  {
    id: '13',
    content: `The total cost is $500 and the discount is $50.`,
  },
  {
    id: '14',
    content: `He earned $1000 in his first job.`,
  },
  {
    id: '15',
    content: `Render this string 50 times in a FlatList:
We now simplify $ \\frac{(a_1 + a_2 + a_3 + \\cdots + a_n)^2}{\\sqrt{(b_1^2 + b_2^2 + \\cdots + b_n^2)(c_1^2 + c_2^2 + \\cdots + c_n^2)}} $ before proceeding further in the solution.`,
  },
];


const PERFORMANCE_TEST_DATA = Array.from({ length: 50 }, (_, i) => ({
  id: `perf-${i + 1}`,
  content: `We now simplify $ \\frac{(a_1 + a_2 + a_3 + \\cdots + a_n)^2}{\\sqrt{(b_1^2 + b_2^2 + \\cdots + b_n^2)(c_1^2 + c_2^2 + \\cdots + c_n^2)}} $ before proceeding further in the solution.`,
}));

type DataItem = { id: string; content: string };

interface ItemProps {
  item: DataItem;
  showId?: boolean;
}


const ListItem = React.memo(function ListItem({ item, showId = true }: ItemProps) {
  return (
    <View style={styles.item}>
      {showId && <Text style={styles.itemId}>#{item.id}</Text>}
      <LatexView
        content={item.content}
        textSize={16}
        textColor="#333333"
        style={styles.latexContainer}
      />
    </View>
  );
});

export default function App() {
  const [showPerfTest, setShowPerfTest] = React.useState(false);

  const renderItem = useCallback(
    ({ item }: { item: DataItem }) => <ListItem item={item} showId={!showPerfTest} />,
    [showPerfTest]
  );

  const keyExtractor = useCallback((item: DataItem) => item.id, []);

  const data = showPerfTest ? PERFORMANCE_TEST_DATA : SAMPLE_DATA;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>LaTeX Renderer Demo</Text>
        <Text style={styles.subtitle}>
          {showPerfTest ? 'Performance Test (50 items)' : 'Sample Expressions (15 items)'}
        </Text>
        <Text
          style={styles.toggleButton}
          onPress={() => setShowPerfTest(!showPerfTest)}
        >
          {showPerfTest ? '← Show Samples' : 'Run Performance Test →'}
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  toggleButton: {
    fontSize: 14,
    color: '#1976D2',
    marginTop: 8,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemId: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 8,
    fontWeight: '600',
  },
  latexContainer: {
    
  },
});
