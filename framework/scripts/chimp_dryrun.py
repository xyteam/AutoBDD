import os.path as path
import subprocess


def dry_run(projectpath, modules, tags):
    marray = {}
    count = 0
    for module in modules:
        marray[module] = []

        result = subprocess.Popen(
            ['cucumber-js', '--dry-run',
             path.join(projectpath, module)] + tags.split(),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        stdout, stderr = result.communicate()

        for content in stdout.decode('utf-8').split('\n'):
            if 'Scenario:' in content or 'Scenario Outline:' in content:
                filepath = content.split('#')[1].strip()
                filepath_base = '/'.join(filepath.split('/')[-2:])
                marray[module].append(filepath_base)
                count += 1

    return (marray, count)
