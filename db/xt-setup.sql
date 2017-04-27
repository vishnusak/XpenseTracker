-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema XT
-- -----------------------------------------------------
-- Schema for the XT site. Will be implemented in mongoDB. Want to use this for visualizing the relationships

-- -----------------------------------------------------
-- Schema XT
--
-- Schema for the XT site. Will be implemented in mongoDB. Want to use this for visualizing the relationships
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `XT` DEFAULT CHARACTER SET utf8 ;
USE `XT` ;

-- -----------------------------------------------------
-- Table `XT`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `XT`.`users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(255) NOT NULL,
  `lastName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `userName` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `userType` VARCHAR(10) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `userName_UNIQUE` (`userName` ASC),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `XT`.`groups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `XT`.`groups` (
  `group_id` INT NOT NULL AUTO_INCREMENT,
  `groupName` VARCHAR(255) NOT NULL,
  `creator_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`, `creator_id`),
  INDEX `fk_groups_users1_idx` (`creator_id` ASC),
  CONSTRAINT `fk_groups_users1`
    FOREIGN KEY (`creator_id`)
    REFERENCES `XT`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `XT`.`sheets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `XT`.`sheets` (
  `sheet_id` INT NOT NULL AUTO_INCREMENT,
  `sheetName` VARCHAR(255) NOT NULL,
  `creator_id` INT NOT NULL,
  `group_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sheet_id`, `creator_id`),
  INDEX `fk_sheets_users1_idx` (`creator_id` ASC),
  INDEX `fk_sheets_groups1_idx` (`group_id` ASC),
  CONSTRAINT `fk_sheets_users1`
    FOREIGN KEY (`creator_id`)
    REFERENCES `XT`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sheets_groups1`
    FOREIGN KEY (`group_id`)
    REFERENCES `XT`.`groups` (`group_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `XT`.`expenses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `XT`.`expenses` (
  `expense_id` INT NOT NULL AUTO_INCREMENT,
  `day` INT NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `subcategory` VARCHAR(255) NULL,
  `amount` FLOAT NOT NULL,
  `paymentType` VARCHAR(10) NOT NULL,
  `card` VARCHAR(10) NULL,
  `notes` VARCHAR(255) NULL,
  `sheet_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`expense_id`, `sheet_id`),
  INDEX `fk_expenses_sheets_idx` (`sheet_id` ASC),
  CONSTRAINT `fk_expenses_sheets`
    FOREIGN KEY (`sheet_id`)
    REFERENCES `XT`.`sheets` (`sheet_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `XT`.`groups_has_users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `XT`.`groups_has_users` (
  `group_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`group_id`, `user_id`),
  INDEX `fk_groups_has_users_users1_idx` (`user_id` ASC),
  INDEX `fk_groups_has_users_groups1_idx` (`group_id` ASC),
  CONSTRAINT `fk_groups_has_users_groups1`
    FOREIGN KEY (`group_id`)
    REFERENCES `XT`.`groups` (`group_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_groups_has_users_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `XT`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
