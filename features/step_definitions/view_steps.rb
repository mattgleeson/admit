Given /^I do nothing$/ do
  visit '/'
end

Then /^I should see "([^"]*)"$/ do |arg1|
  assert page.has_content?(arg1)
end
