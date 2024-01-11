import mm from "music-metadata"
import fs from "node:fs/promises"
import child_process from "node:child_process"
import util from "node:util"
const td = new util.TextDecoder()

main()

const map = new Map()
const lmap = new Map() // 保存已经提取过的歌词
async function main() {
  const music_folder = "/home/alice/Music"
  await recurIndex(music_folder)
  fs.writeFile("./map.txt", JSON.stringify(Array.from(map.entries())))


  setInterval(() => {
    const s = child_process.spawn('mpc', ['status'])
    s.stdout.on('data', async (data) => {
      let song_name = td.decode(data)
      let t = song_name.split("\n")[1].split(" ")[4].split("/")[0]
      song_name = song_name.split("\n")[0]
      song_name = song_name.substring(song_name.indexOf("-")+2, song_name.length).trim();
      const song_file_path = map.get(song_name)
      const has = lmap.get(song_name)
      const cl = Boolean(has)?has:await get_current_lyrics(song_file_path)
      if(cl&&!Boolean(has)) lmap.set(song_name, cl)
      if(compare(t, cl[0].time)===-1) {
        process.stdout.clearLine(1)
        process.stdout.cursorTo(0, 0)
        process.stdout.write(song_name+"\r")
      }
      else if(compare(t, cl[cl.length-1].time)===1) {
        process.stdout.clearLine(1)
        process.stdout.cursorTo(0, 0)
        process.stdout.write(cl[cl.length-1].text+"\r")
      }
      else {
        for(let i = 0; i < cl.length-1; i++) {
          let j = i+1;
          if(compare(t, cl[i].time)===1&&compare(t, cl[j].time)===-1) {
            if(cl[i].text.trim())
            {
              process.stdout.clearLine(1)
              process.stdout.cursorTo(0, 0)
              process.stdout.write("\x1b[32m"+cl[i].text+"\r")
            }
            else{
              process.stdout.clearLine(1)
              process.stdout.cursorTo(0, 0)
              process.stdout.write("󰝚󰝚󰝚󰝚󰝚󰝚󰝚󰝚󰝚󰝚\r")
            }
            break;
          }
        }
      }
    })
  }, 1000)


  function compare(t1, t2) {
    let [t1x, t1y] = t1.split(":").map(x => parseInt(x))
    let [t2x, t2y] = t2.split(":").map(x => parseInt(x))
    if(t1x<t2x) return -1;
    else if(t1x>t2x) return 1;
    else {
      if(t1y<t2y) return -1;
      else return 1;
    }
   }
}




async function recurIndex(path) {
  const s = await fs.stat(path)
  if(!s.isDirectory()) {
      const res = await mm.parseFile(path)
      const song_name = res.common.title.trim();
      map.set(song_name, path)
  }else {
     const items = await fs.readdir(path)
  for(const item of items) {
    const item_path = path + "/" + item
    const s = await fs.stat(item_path) 
    if(s.isDirectory()) {
      await recurIndex(item_path)
    }else {
      const res = await mm.parseFile(item_path)
      const song_name = res.common.title.trim();
      map.set(song_name, item_path)
    }
  }
  }
   
}

async function get_current_lyrics(file_path) {
  const res = await mm.parseFile(file_path)
  let lyrics = res.common.lyrics
  lyrics = lyrics[0].split("\n")
  lyrics = lyrics.map(x => generate_time_text_pair(x))
  return lyrics;

  function generate_time_text_pair(line) {
    const time = line.substring(1, 6);
    const text = line.substring(10, line.length)
    let pair = {
      time,
      text
    }
    return pair;
  }
}


