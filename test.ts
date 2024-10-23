class HandleString {
    data: string[] = []
}

class HandleNumber {
    data: number[] = []
}

class HandleAnything<T> {
    data: T[] = []
}

const handleNumber = new HandleAnything<number>()
handleNumber.data.push(600)

const handleString = new HandleAnything<string>()