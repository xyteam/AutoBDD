const robot = require('robotjs');
const cmd = require('node-cmd');
const fs = require('fs');
const execSync = require('child_process').execSync;
const myHOME = process.env.HOME;
const myPlatformIdSrc = myHOME + '/Projects/xyPlatform/global/platform_id_rsa';
const myPlatformId = myHOME + '/.ssh/platform_id_rsa';
const myDISPLAY = process.env.DISPLAY;
const myPLATFORM = process.env.PLATFORM;
const myBROWSER = process.env.BROWSER;
const mySSHHOST = process.env.SSHHOST;
const mySSHPORT = process.env.SSHPORT;
const mySSHUSER = process.env.SSHUSER;
const mySSHPASS = process.env.SSHPASS;
const mySELHOST = process.env.SELHOST;
const mySELPORT = process.env.SELPORT;
const myRDPHOST = process.env.RDPHOST;
const myRDPPORT = process.env.RDPPORT;
const myRDPUSER = process.env.RDPUSER || mySSHUSER;
const myRDPPASS = process.env.RDPPASS || mySSHPASS;
const mySSHConnString = mySSHUSER + '@' + mySSHHOST + ' -p ' + mySSHPORT;
const myRDPConnString = myRDPHOST + ':' + myRDPPORT + ' -u ' + myRDPUSER + ' -p ' + myRDPPASS;
const mySELPortMapString = ' -L' + mySELPORT + ':' + mySELHOST + ':' + 4444;
const myRDPPortMapString = ' -L' + myRDPPORT + ':' + myRDPHOST + ':' + 3389;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const myMOVIE = process.env.MOVIE;
const mySCREENSHOT = process.env.SCREENSHOT;
const myREPORTDIR = process.env.REPORTDIR;
const myMODULEPATH = process.env.MODULEPATH;
const myFrameworkPath = process.env.FrameworkPath;
const myDownloadPathLocal = '/tmp/download_' + myDISPLAY.substr(1); 
const mySSHFSConnString = mySSHUSER + '@' + mySSHHOST + ':Downloads/ ' + myDownloadPathLocal + ' -p ' + mySSHPORT;
const cmd_copy_PlatformId = 'cp ' + myPlatformIdSrc + ' ' + myPlatformId + '; chmod 0600 ' + myPlatformId;
const cmd_umount = 'if mountpoint -q ' + myDownloadPathLocal + '; then fusermount -u ' + myDownloadPathLocal + '; fi';
const cmd_umount_try = 'fusermount -q -u ' + myDownloadPathLocal;

// ssh_tunnel
const cmd_check_ssh_tunnel = 'pgrep -f "ssh .*' + mySSHConnString + '"';
const cmd_start_ssh_tunnel = 'ssh -N '
                    + ' -o IdentityFile=' + myPlatformId
                    + ' -o StrictHostKeyChecking=no '
                    + mySSHConnString + mySELPortMapString + myRDPPortMapString
                    + ' &';
const cmd_stop_ssh_tunnel = 'sleep 2; pkill -f "ssh .*' + mySSHConnString + '"';

// sshfs_mount
const cmd_check_sshfs_mount = 'pgrep -f "sshfs .*' + mySSHFSConnString + '"';
const cmd_start_sshfs_mount = 'sshfs -o uid=$(id -u),gid=$(id -g) -o nonempty'
                            + ' -o IdentityFile=' + myPlatformId
                            + ' -o StrictHostKeyChecking=no '
                            + mySSHFSConnString;
const cmd_stop_sshfs_mount = 'if mountpoint -q ' + myDownloadPathLocal
                            + '; then fusermount -u ' + myDownloadPathLocal + '; fi';

// rdesktop
const cmd_check_rdesktop = 'pgrep -f "rdesktop .*' + myRDPHOST + ':' + myRDPPORT + '"';
const cmd_start_rdesktop = 'DISPLAY=' + myDISPLAY
                          + ' rdesktop -fa 15 -mE '
                          + myRDPConnString
                          + ' &';
const cmd_stop_rdesktop = 'pkill -f "rdesktop .*' + myRDPHOST + ':' + myRDPPORT + '"';
const cmd_create_rdesktop_lock = 'echo "' + cmd_start_rdesktop + '"'
                                + ' > /tmp/rdesktop.' + myRDPHOST + ':' + myRDPPORT + '.lock';
const cmd_remove_rdesktop_lock = 'rm -f /tmp/rdesktop.' + myRDPHOST + ':' + myRDPPORT + '.lock';

module.exports = {
  // ssh_tunnel
  sshTunnelRunning: function() {
    // return true if running, false if not
    // filter empty element, total number of pid including self
    var pidCount = execSync(cmd_check_ssh_tunnel).toString().split('\n').filter(Boolean).length
    if (pidCount >= 2) {
      return true;
    } else {
      return false;
    }
  },
  startSshTunnel: function() {
    fs.existsSync(myHOME + '/.ssh') || fs.mkdirSync(myHOME + '/.ssh');
    fs.existsSync(myPlatformId) || execSync(cmd_copy_PlatformId);
    if (!this.sshTunnelRunning()) {
      cmd.run(cmd_start_ssh_tunnel);
    } 
  },
  stopSshTunnel: function() {
    if (this.sshTunnelRunning()) {
      cmd.run(cmd_stop_ssh_tunnel);
    } 
  },

  // sshfs_mount
  sshFsRunning: function() {
    // return true if running, false if not
    // filter empty element, total number of pid including self
    var pidCount = execSync(cmd_check_sshfs_mount).toString().split('\n').filter(Boolean).length
    if (pidCount >= 2) {
      return true;
    } else {
      return false;
    }
  },
  startSshFs: function() {
    fs.existsSync(myDownloadPathLocal) || fs.mkdirSync(myDownloadPathLocal);
    if (!this.sshFsRunning()) {
      cmd.run(cmd_start_sshfs_mount);
    } 
  },
  stopSshFs: function() {
    if (this.sshFsRunning()) {
      cmd.run(cmd_stop_sshfs_mount);
    } 
  },

  // rdesktop
  rdesktopRunning: function() {
    // return true if running, false if not
    // filter empty element, total number of pid including self
    var pidCount = execSync(cmd_check_rdesktop).toString().split('\n').filter(Boolean).length
    if (pidCount >= 2) {
      return true;
    } else {
      return false;
    }
  },
  startRdesktop: function() {
    if (!this.rdesktopRunning()) {
      execSync(cmd_create_rdesktop_lock);
      cmd.run(cmd_start_rdesktop);
    } 
  },
  stopRdesktop: function() {
    if (this.rdesktopRunning()) {
      cmd.run(cmd_stop_rdesktop);
      execSync(cmd_remove_rdesktop_lock);
    } 
  }
}