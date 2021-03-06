import React from 'react';
import { useState } from 'react';
import { Alert, Container, ActionIcon, Group, Space, Accordion, Text, AccordionControlProps, Box, List, Button, TextInput, Collapse, Divider } from '@mantine/core';
import { IconDots, IconPlus } from '@tabler/icons';

function AccordionControl(props: AccordionControlProps) {
  const [listName, setListName] = useState();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Accordion.Control {...props} />
      <ActionIcon size="lg">
        <IconDots size={16} />
      </ActionIcon>
    </Box>
  );
}

export default function StockList(props) {
  type lists = Record<string, Record<string, number>>

  const emptyList = new Array();
  const UserStockLists: Array<lists> = [{"tech": {"amd": 102, "nvda": 170}}, {"oil": {"bp": 40, "shell": 50}}];
  const UserStockLists2 = [{"tech": {"amd": 102, "nvda": 170}}, {"oil": {"bp": 40, "shell": 50}}];

  const [listFromDB, setUpdatedList] = useState(UserStockLists);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState<string>('')
  const [value, setValue] = useState<string>('');
  
  if (!Array.isArray(listFromDB) || !listFromDB.length) {
    return (
      <Container size={200}>
        <Group position="apart" sx={{ width: 200 }}>
          <Text size="lg">Lists</Text>
          <Space w="md" />
          <ActionIcon color="dark" onClick={() => setOpened(true)}>
            <IconPlus size={16}/>
          </ActionIcon>
        </Group>
        <Space h="sm" />
        <Collapse in={opened} sx={{ width: 200 }}>
          <TextInput placeholder="Name your list!" error={error} value={value} 
          onChange={(event) => setValue(event.currentTarget.value)} />
          <Space h="xs" />
          <Group position="apart">
            <Button variant="outline" color="dark" onClick={() => setOpened(false)}>Cancel</Button>
            <Button variant="outline" color="dark" 
                    onClick={() => addListHandler("userId", value)
                    .then(() => {
                      const temp = {};
                      temp[value] = {};
                      setValue('');
                      setUpdatedList(UserStockLists.concat([temp]));
                      setOpened(false);})
                    .catch((err) => {
                      console.log(err);
                      setOpened(true);
                      setError("There was an error, please try again");})}>Add</Button>
          </Group>
        </Collapse>
      </Container>
  );
  }
  else {
    return (
      <Container size={200}>
        <Group position="apart" sx={{ width: 200 }}>
          <Text size="lg">Lists</Text>
          <Space w="md" />
          <ActionIcon color="dark" onClick={() => setOpened(true)}>
            <IconPlus size={16}/>
          </ActionIcon>
        </Group>
        <Space h="sm" />
        <Collapse in={opened} sx={{ width: 200 }}>
          <TextInput placeholder="Name your list!" error={error} value={value} 
          onChange={(event) => setValue(event.currentTarget.value)} />
          <Space h="xs" />
          <Group position="apart">
            <Button variant="outline" color="dark" onClick={() => setOpened(false)}>Cancel</Button>
            <Button variant="outline" color="dark" 
                    onClick={() => addListHandler("userId", value)
                    .then(() => {
                      const temp = {};
                      temp[value] = {};
                      setValue('');
                      setUpdatedList(UserStockLists.concat([temp]));
                      setOpened(false);})
                    .catch((err) => {
                      console.log(err);
                      setOpened(true);
                      setError("There was an error, please try again");})}>Add</Button>
          </Group>
        </Collapse>
      <Accordion multiple={true} chevronPosition="left" sx={{ width: 200 }} mx="auto">
        {listFromDB.map((it) => Object.entries(it).map(([key, values]) => 
        <Accordion.Item value={key} key={key}>
        <AccordionControl>{key}</AccordionControl>
        <Accordion.Panel>
          <List>
            {Object.entries(values).map(([valueKey, valueValue]) => 
            <List.Item key={valueKey}>{valueKey}: {valueValue}</List.Item>
            )}
          </List>
        </Accordion.Panel>
        </Accordion.Item>
        ))}
      </Accordion>
      </Container>
    );
  }
}

//need to get a uuid from creation of user acc, if not, just show empty list with "create an account to create watch lists"
//if no lists, create an empty list with something such as "create a list to start tracking stocks"
export async function getServerSideProps(userID, context) {

  const res = await fetch(`http://localhost:8080/users/${userID}/list`);
  const lists = await res.json();

  const templists = new Array([{"name": "tech", "list": {"amd": 102, "nvda": 170}}, {"name": "oil", "list": {"bp": 40, "shell": 50}}]);

  if (!lists) {
    return {
      
    }
  }

  return { props: { templists } }
}

export async function addListHandler(userID, lists) {
  console.log(userID, lists)
  // fetch(`http://localhost:8080/users/${userID}/list`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(lists),
  // });
}

export async function updateListHandler(userID, list) {

  fetch(`http://localhost:8080/users/${userID}/list/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(list),
  });
}

export async function updateListNameHandler(userID, name) {

  fetch(`http://localhost:8080/users/${userID}/list/${name}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    }
  });
}