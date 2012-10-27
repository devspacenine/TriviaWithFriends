from scrapy.contrib.spiders import CrawlSpider, Rule
from scrapy.http import Request, FormRequest
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.selector import HtmlXPathSelector
from scrapy import log
from quiz_parser.items import SimpleQuestion, MultipleChoice
import pprint, re, unicodedata
from datetime import datetime

pp = pprint.PrettyPrinter(indent=1, depth=1, width=200)

class MySpider(CrawlSpider):
    name = 'quiz_parser'
    allowed_domains = ['quizdatabase.com']
    start_urls = ['http://www.quizdatabase.com/Login.asp?From=Browse'] 

    rules = (
            Rule(SgmlLinkExtractor(allow=('Browse.asp\?Action=Process&Source=Page&Page=[0-9]+&DF=0&CT=[0-9]+&SM=&KW=&KS=[All|Any]$',), unique=True), callback='parse_questions'),
            ) 

    def parse(self, response):
        self.log('Logging in', level=log.INFO)

        return [FormRequest.from_response(response, formdata={'txtEmail': 'corey.pauley@imaginuity.com', 'txtPassword': 'shothot3'}, callback=self.after_login)]

    def after_login(self, response):
        browse_urls = [
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=10&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=9&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=8&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=7&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=6&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=5&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=4&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=3&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=2&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=1&SM=&KW=&KS=All'
            ]
        for url in browse_urls:
            yield Request(url, callback=self.parse_questions)

    def parse_questions(self, response):
        self.log('Parsing questions: %s' % response.url, level=log.INFO)

        categories = {
            '10':'Entertainment/People',
            '9': 'Music',
            '8': 'Geography',
            '7': 'History',
            '6': 'Literature',
            '5': 'Science',
            '4': 'Films',
            '3': 'TV',
            '2': 'Sport',
            '1': 'General'
        }
    
        hxs = HtmlXPathSelector(response)
        params = {}
        ##self.log('Response body: ' + response.body, level=log.INFO)
        for param in response.url.split('?')[1].split('&'):
            params[param.split('=')[0]] = param.split('=')[1]
        questions = hxs.select('//form/table[3]/tr[position()>1]/td/table')
        ##self.log('Questions Selector: ' + str(questions.extract()), level=log.INFO)
        count = 0
        for question in questions:
            simple_question = SimpleQuestion()
            ##self.log('question: ' + hxs.select('//form/table[3]/tr/td/table/tr[1]/td[1]/font/text()').extract()[0], level=log.INFO)
            simple_question['question'] = hxs.select('//form/table[3]/tr[position()>1]/td/table/tr[1]/td[1]/font/text()').extract()[count].strip().replace('Q. ', '').replace(' ?', '?')
            simple_question['answer'] = hxs.select('//form/table[3]/tr[position()>1]/td/table/tr[2]/td[1]/font/text()').extract()[count].strip().replace('A. ', '')
            simple_question['difficulty'] = hxs.select('//form/table[3]/tr[position()>1]/td/table/tr[3]/td[1]/font/i/text()').extract()[count].strip().split(' ')[1]
            simple_question['subject'] = categories[params['CT']]
            count += 1
            yield simple_question
        yield Request('http://www.quizdatabase.com/%s' % hxs.select('(//form/a[@class="link"])[last()]/@href').extract()[0], callback=self.parse_questions)

"""
    def parse_questions(self, response):
        self.log('Parsing questions: %s' % response.url, level=log.INFO)
    
        hxs = HtmlXPathSelector(response)
        params = {}
        for param in response.url.split('?')[1].split('&'):
            params[param.split('=')[0]] = param.split('=')[1]
        questions = hxs.select('//form/p/table/tbody//tr/td/table')
        for question in questions:
            simple_question = SimpleQuestion()
            simple_question['question'] = question.select('./tbody/tr[1]/td[1]/font').extract()[0].strip().replace('Q. ', '').replace(' ?', '?')
            simple_question['answer'] = question.select('./tbody/tr[2]/td[1]/font').extract()[0].strip().replace('A. ', '')
            simple_question['difficulty'] = question.select('./tbody/tr[3]/td[1]/font/i').extract()[0].strip().split(' ')[1]
            simple_question['subject'] = categories[params['CT']]
            yield simple_question
"""
