use bytes::BufMut;
use futures::TryStreamExt;
use uuid::Uuid;
use warp::{
    multipart::{FormData, Part},
    Filter, Rejection, Reply,
};

async fn upload(form: FormData) -> Result<impl Reply, Rejection> {
    let parts: Vec<Part> = form.try_collect().await.map_err(|e| {
        eprintln!("form error: {}", e);
        warp::reject::reject()
    })?;

    for p in parts {
        if p.name() == "file" {
            let content_type = p.content_type();
            let file_ending;
            match content_type {
                Some(file_type) => match file_type {
                    "application/pdf" => {
                        file_ending = "pdf";
                    }
                    "image/png" => {
                        file_ending = "png";
                    }
                    v => {
                        eprintln!("invalid file type found: {}", v);
                        return Err(warp::reject::reject());
                    }
                },
                None => {
                    eprintln!("file type could not be determined");
                    return Err(warp::reject::reject());
                }
            }

            let value = p
                .stream()
                .try_fold(Vec::new(), |mut vec, data| {
                    vec.put(data);
                    async move { Ok(vec) }
                })
                .await
                .map_err(|e| {
                    eprintln!("reading file error: {}", e);
                    warp::reject::reject()
                })?;

            let file_name = format!("./files/{}.{}", Uuid::new_v4().to_string(), file_ending);
            tokio::fs::write(&file_name, value).await.map_err(|e| {
                eprint!("error writing file: {}", e);
                warp::reject::reject()
            })?;
            println!("created file: {}", file_name);
        }
    }

    Ok("succes")
}

#[tokio::main]
async fn main() {
    let index = warp::get().and(warp::path::end()).map(|| "Hello, world!");

    let fibonacci = warp::get().and(warp::path("fibonacci")).map(|| {
        let mut a: i32 = 0;
        let mut b: i32 = 1;
        for _ in 0..20 {
            let c: i32 = a + b;
            a = b;
            b = c;
        }

        warp::reply::json(&vec![a, b])
    });

    let darken_image = warp::post()
        .and(warp::path("darken_image"))
        .and(warp::multipart::form().max_length(5_000_000))
        .and_then(upload);

    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST", "DELETE", "PUT", "OPTIONS"]);

    let routes = index.or(fibonacci).or(darken_image).with(cors);

    warp::serve(routes).run(([127, 0, 0, 1], 5001)).await;
}
