testSectionBegin="=======\nTest\n-------"
testSectionEnd="----------\nDone Test\n=========="

.PHONY: test-all test clean e2e-test cy-test js-test py3-test py2-test k6-test

clean:
	@echo "cleaning build-test folder...";
	rm -rf test-results/*;
	find . -type d -name "__pycache__" -o -name ".pytest_cache" | xargs rm -rf;
	find . -type f -name "*.pyc" | xargs rm -f;
	find e2e-test -type d -name logs | xargs rm -rf;
	find e2e-test -type f -name "test-*.json" | xargs rm -f;
	find e2e-test -type f -name "Passed_*.???" -o -name "Failed_*.???" -o -name "Recording_*.???" | xargs rm -f;

e2e-arunner:
	@echo ${testSectionBegin};
	@echo "running cucumber test with arunner.sh (single runner)...";
	cd e2e-test/test-init && arunner.sh || exit $$?;
	@echo ${testSectionEnd}

e2e-prunner:
	@echo ${testSectionBegin};
	@echo "running cucumber test with prunner.sh (parllel runner)...";
	cd e2e-test/test-something && prunner.sh || exit $$?;
	@echo ${testSectionEnd}

e2e-autorunner: clean
	@echo ${testSectionBegin};
	@echo "running cucumber test with autorunner (parallel runner with cucumber report)...";
	autorunner.py --project autobdd-test --reportpath build-test --movie 1 -- --cucumberOpts.tags='not @Init and not @Report' || exit $$?;
	find test-results/build-test -type f -name "*.run" | xargs cat || exit $$?;
	@echo ${testSectionEnd}

e2e-autoreport:
	@echo ${testSectionBegin};
	@echo "checking cucumber report...";
	cd e2e-test/check-report && prunner.sh || exit $$?;
	@echo ${testSectionEnd}

e2e-test: e2e-arunner e2e-prunner e2e-autorunner e2e-autoreport

js-test:
	@echo ${testSectionBegin};
	@echo "running jest unit test...";
	jest --verbose js-test || exit $$?;
	@echo ${testSectionEnd}

py3-test:
	@echo ${testSectionBegin};
	@echo "running python3 unit test...";
	python3 -m pytest -r A py-test || exit $$?;
	@echo ${testSectionEnd}

py2-test:
	@echo ${testSectionBegin};
	@echo "running python2 unit test...";
	python2 -m pytest -r A py-test || exit $$?;
	@echo ${testSectionEnd}

cal-app-start:
	@echo "starting up cal-app...";
	cd cal-app && npm install && npm start
	
cal-app-stop:
	@echo "stopping cal-app...";
	cd cal-app && npm stop

cy-test: cal-app-start
	@echo ${testSectionBegin};
	@echo "running cypress test...";
	cd cal-app && cypress run || exit $$?;
	@echo ${testSectionEnd}

k6-test:
	@echo ${testSectionBegin};
	@echo "running k6 performance test...";
	cd k6-test && find . -type f -name "*-test.js" | xargs k6 run || exit $$?;
	@echo ${testSectionEnd}

test-all: e2e-test cy-test js-test py3-test py2-test k6-test
