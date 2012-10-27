# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/topics/items.html

from scrapy.item import Item, Field

class SimpleQuestion(Item):
    question = Field()
    answer = Field()
    difficulty = Field()
    subject = Field()
    category = Field()
    sub_category = Field()

class MultipleChoice(Item):
    question = Field()
    answer = Field()
    wrong_1 = Field()
    wrong_2 = Field()
    wrong_3 = Field()
    difficulty = Field()
    subject = Field()
    category = Field()
    sub_category = Field()
