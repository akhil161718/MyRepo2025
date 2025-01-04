int[] array = {0, 1, 0, 3, 12}; // Example input
int n = array.length;
int index = 0;

// Move all non-zero elements to the front
for (int i = 0; i < n; i++) {
    if (array[i] != 0) {
        array[index++] = array[i];
    }
}

// Fill the remaining positions with zeros
while (index < n) {
    array[index++] = 0;
}

// Output the result
System.out.println(Arrays.toString(array));

//////////////////////////////////////////////////////////////////////


List<Integer> array = new ArrayList<>(Arrays.asList(0, 1, 0, 3, 12)); // Example input
int totalZeros = 0;

// Remove zeros and count them
Iterator<Integer> iterator = array.iterator();
while (iterator.hasNext()) {
    if (iterator.next() == 0) {
        iterator.remove();
        totalZeros++;
    }
}

// Add zeros at the end
for (int i = 0; i < totalZeros; i++) {
    array.add(0);
}

// Output the result
System.out.println(array);
