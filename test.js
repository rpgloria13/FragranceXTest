const assert = require('assert');
const { Builder, By, Key, until } = require('selenium-webdriver');

async function runTest() {
    const driver = new Builder().forBrowser('chrome').build();

    try {

        console.log("===== Test started =====")
        // a. Go to fragrancex.com
        await driver.get('https://www.fragrancex.com');

        // Close modal 
        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//div[@id='coupon-popup']"))), 50000);
        const closeModal = await driver.findElement(By.xpath("//img[@class='close-popup']"));
        await closeModal.click();

        // b. Store all links in an object
        const allLinks = await driver.findElements(By.xpath('//a'));
        const linksObject = {};
        for (let i = 0; i < allLinks.length; i++) {
            const linkText = await allLinks[i].getText();
            const linkHref = await allLinks[i].getAttribute('href');
            linksObject[linkText] = linkHref;
        }
        console.log(linksObject)

        // c. Log/store all Perfume names found under “Top Picks For You” section
        const topPicksSection = await driver.findElement(By.xpath('//h2[text()="Top picks for you"]'));
        const perfumeNames = await topPicksSection.findElements(By.xpath(".//following-sibling::div//div[@class='content-container']//div[contains(@class,'content')]//div[@class='serif h3']"));
        const perfumeNamesArray = [];
        for (let i = 0; i < perfumeNames.length; i++) {
            const perfumeName = await perfumeNames[i].getText();
            const splitPerfumeName = perfumeName;
            perfumeNamesArray.push(splitPerfumeName);
        }
        console.log('Perfume Names:', perfumeNamesArray);

        // d. Click on the 3rd product in “Top picks for you”
        await perfumeNames[2].click();

        // e. Verify that the product name selected was displayed
        const selectedProduct = await driver.findElement(By.xpath("//h1[@class='product-header-name']//span[contains(@class,'perfume-name')]"));
        const selectedProductName = await selectedProduct.getText();
        console.log('Selected Product Name:', selectedProductName);
        assert.ok(selectedProductName.includes(perfumeNamesArray[2]), `Product name selected was not displayed`);

        // f. Add the 2nd product variant to the bag
        const addToCart = await driver.findElement(By.xpath("(//button[contains(text(),'Add to')])[3]"));
        const secondVariantDescription = await driver.findElement(By.xpath("(//h2[@class='listing-description serif h5'])[2]"));
        const secondVariantName = await secondVariantDescription.getText();
        console.log('Second Product Variant Name:', secondVariantName);
        await addToCart.click();

        // g. Verify that count '1' is added to the bag icon
        const bagCount = await driver.findElement(By.xpath("//div[@class='count']"));
        const bagCountText = await bagCount.getText();
        assert.strictEqual(bagCountText, '1', `Text mismatch: ${bagCountText} != '1'`);

        // h. Update quantity to 5
        const dropdown = await driver.findElement(By.xpath("//select[@class='cart-qty-select']"));
        await dropdown.click()
        const option = await driver.findElement(By.xpath("//option[@value='5']"));
        await option.click()
        const timeout = 5000;
        await driver.wait(until.elementTextIs(bagCount, '5'), timeout)
        const newBagCountText = await bagCount.getText();
        assert.strictEqual(newBagCountText, '5', `Text mismatch: ${newBagCountText} != '5'`);

        // End the test
        console.log("===== Test finished =====");
    } finally {
        driver.quit();
    }
}

runTest();
