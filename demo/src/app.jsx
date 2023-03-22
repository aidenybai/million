import {
  Container,
  Flex,
  Heading,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import TimesTable from './times-table';

function App() {
  const [nodes, setNodes] = useState(100);
  const handleChange = (nodes) => setNodes(nodes);
  return (
    <Container p={4}>
      <Heading mb={4}>Million Demo</Heading>
      <Text>
        The following is a random times table generator benchmark. It follows a
        comparison between React and Million, along with its fiber equivalents.
      </Text>
      <Text fontStyle="italic" size="sm" my={3}>
        Caveat to note: Every row contains 50 empty nodes to stimulate diffing
        in order to measure performance.
      </Text>
      <Text>
        You can adjust the number of rows by using the slider or the number
        input.
      </Text>
      <Flex mt={3}>
        <NumberInput
          maxW={1000}
          min={0}
          mr="2rem"
          value={nodes}
          onChange={handleChange}
        >
          <NumberInputField placeholder="Enter number of rows" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Flex>
      <Tabs variant="soft-rounded" colorScheme="purple" mt={3}>
        <TabList>
          <Tab>React</Tab>
          <Tab>React Fiber</Tab>
          <Tab>Million</Tab>
          <Tab>Million Fiber</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TimesTable nodes={nodes} mode="react" />
          </TabPanel>
          <TabPanel>
            <TimesTable nodes={nodes} mode="react-fiber" />
          </TabPanel>
          <TabPanel>
            <TimesTable nodes={nodes} mode="million" />
          </TabPanel>
          <TabPanel>
            <TimesTable nodes={nodes} mode="million-fiber" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

export default App;
