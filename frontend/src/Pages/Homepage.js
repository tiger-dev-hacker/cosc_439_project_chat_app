import { Box, color, Container, Tab, Tabs, TabList, TabPanel, TabPanels, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import Login from '../components/ui/Authentication/Login';
import Signup from '../components/ui/Authentication/Signup';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
const Homepage = () => {

  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);

  return (
    <Container maxW={'xl'} centerContent>
      <Box
        d='flex'
        justifyContent='center'
        p={3}
        bg={"white"}
        w="100%"
        m="40px 0 15px 0"
        borderRadius={"lg"}
        borderWidth={"1px"}
      >
        <Text fontSize="4xl" fontFamily="Work sans" color="black" textAlign={"center"}> ChatCord</Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" color='black' borderWidth={"1px"}>
      <Tabs variant='soft-rounded' >
  <TabList mb='1em'>
    <Tab width={"50%"}>Login </Tab>
    <Tab width={"50%"}>Sign Up</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
    <Login />
    </TabPanel>
    <TabPanel>
      <Signup/>
    </TabPanel>
  </TabPanels>
</Tabs>
      </Box>
    </Container>
  )
};

export default Homepage;