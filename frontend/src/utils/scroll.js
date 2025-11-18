export const scroll = (listRef) => {
    const scrollByAmount = (amount) => {
        if (listRef.current) {
            listRef.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    };

    const scrollLeft = () => scrollByAmount(-400); 
    const scrollRight = () => scrollByAmount(400); 

    return {
        scrollLeft,
        scrollRight
    }
}