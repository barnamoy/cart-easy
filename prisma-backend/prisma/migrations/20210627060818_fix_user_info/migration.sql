-- AlterTable
ALTER TABLE `userinfo` MODIFY `name` VARCHAR(200) NOT NULL,
    MODIFY `phone` VARCHAR(200) NOT NULL,
    MODIFY `address` VARCHAR(200) NOT NULL,
    MODIFY `email` VARCHAR(200) NOT NULL,
    MODIFY `orderid` VARCHAR(200) NOT NULL DEFAULT 'None';
