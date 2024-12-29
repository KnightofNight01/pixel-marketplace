import React from 'react';
import {
    Box,
    VStack,
    Button,
    Text,
    HStack,
} from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/color-mode';

const COLORS = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#000000', // Black
    '#FFFFFF', // White
];

const ControlPanel = ({ selectedColor, onColorSelect, cooldown }) => {
    const bg = useColorModeValue('white', 'gray.800');

    return (
        <Box
            position="fixed"
            top="20px"
            right="20px"
            bg={bg}
            p={4}
            borderRadius="md"
            boxShadow="lg"
            zIndex="1000"
        >
            <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" textAlign="center">Color Palette</Text>
                <HStack spacing={2} wrap="wrap" justify="center">
                    {COLORS.map((color) => (
                        <Button
                            key={color}
                            w="30px"
                            h="30px"
                            bg={color}
                            onClick={() => onColorSelect(color)}
                            border={selectedColor === color ? '2px solid black' : 'none'}
                            _hover={{ transform: 'scale(1.1)' }}
                        />
                    ))}
                </HStack>
                {cooldown > 0 && (
                    <Text textAlign="center" color="red.500">
                        Wait {cooldown}s
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default ControlPanel; 